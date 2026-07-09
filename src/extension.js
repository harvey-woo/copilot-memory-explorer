/**
 * Extension entry point — Memory Explorer using TreeView with native context menus.
 */
const vscode = require('vscode');
const path = require('path');
const { MemoryParser, DEFAULT_SESSION_IDS } = require('./memory-parser');

// --- i18n: vscode.l10n.t ---
const localize = (msg, ...args) => {
  try { return vscode.l10n.t(msg, ...args); } catch { return msg; }
};

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  console.log('[Memory Explorer] Activating...');

  const provider = new MemoryTreeProvider(context);

  // Register TreeView
  const treeView = vscode.window.createTreeView('memoryExplorer.mainView', {
    treeDataProvider: provider,
  });
  context.subscriptions.push(treeView);

  // Memory Preview provider (must be created before commands that use it)
  const previewProvider = new MemoryPreviewProvider(context);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('memoryExplorer.previewView', previewProvider, {
      webviewOptions: { retainContextWhenHidden: true },
    })
  );

  // Refresh command
  context.subscriptions.push(
    vscode.commands.registerCommand('memoryBoard.refresh', () => {
      provider.refresh();
    })
  );

  // Click to open file + show preview in panel
  context.subscriptions.push(
    vscode.commands.registerCommand('memoryBoard.openFile', (item) => {
      const fp = item?.resourceUri?.fsPath || item?.filePath;
      if (fp) {
        // Open in editor
        vscode.workspace.openTextDocument(vscode.Uri.file(fp))
          .then(doc => vscode.window.showTextDocument(doc, { preview: true }));
        // Also show in preview panel
        previewProvider.showPreview(fp);
      }
    })
  );

  // Context menu: Copy Path
  context.subscriptions.push(
    vscode.commands.registerCommand('memoryBoard.copyPath', (item) => {
      const fp = item?.resourceUri?.fsPath || item?.filePath;
      if (fp) {
        vscode.env.clipboard.writeText(fp);
      }
    })
  );

  // Context menu: Reveal in Finder
  context.subscriptions.push(
    vscode.commands.registerCommand('memoryBoard.revealInOs', (item) => {
      const fp = item?.resourceUri?.fsPath || item?.filePath;
      if (fp) {
        vscode.commands.executeCommand('revealFileInOS', vscode.Uri.file(fp));
      }
    })
  );

  // Sort: cycle through: name-asc → name-desc → date-desc → date-asc → name-asc
  context.subscriptions.push(
    vscode.commands.registerCommand('memoryBoard.toggleSort', () => {
      provider.cycleSort();
    })
  );

  // Delete entry (file, directory, or session)
  context.subscriptions.push(
    vscode.commands.registerCommand('memoryBoard.deleteEntry', async (item) => {
      const fp = item?.resourceUri?.fsPath || item?.filePath;
      if (!fp) return;
      const uri = vscode.Uri.file(fp);
      const stat = await vscode.workspace.fs.stat(uri);
      const isDir = stat.type === vscode.FileType.Directory;
      const name = path.basename(item.filePath);

      const deleteLabel = localize('Delete');
      const confirm = await vscode.window.showWarningMessage(
        localize(isDir ? 'Delete directory "{0}"?' : 'Delete file "{0}"?', name),
        { modal: true },
        deleteLabel
      );
      if (confirm !== deleteLabel) return;

      try {
        if (isDir) {
          await vscode.workspace.fs.delete(uri, { recursive: true });
        } else {
          await vscode.workspace.fs.delete(uri);
        }
        provider.refresh();
      } catch (err) {
        vscode.window.showErrorMessage(localize('Failed to delete: {0}', err.message));
      }
    })
  );

  // New memory file
  context.subscriptions.push(
    vscode.commands.registerCommand('memoryBoard.newMemory', async (item) => {
      // Determine target directory
      let targetDir = '';
      const fp = item?.resourceUri?.fsPath || item?.filePath;
      if (fp) {
        const stat = await vscode.workspace.fs.stat(vscode.Uri.file(fp));
        if (stat.type === vscode.FileType.Directory) {
          targetDir = fp;
        } else {
          targetDir = path.dirname(fp);
        }
      } else if (provider._currentWorkspaceId && provider._parser) {
        // Default to repo directory
        const repoDir = provider._parser.getMemoriesDir(provider._currentWorkspaceId) + '/repo';
        targetDir = repoDir;
      }

      if (!targetDir) {
        vscode.window.showErrorMessage(localize('Could not determine target directory.'));
        return;
      }

      // Ask for file name
      const name = await vscode.window.showInputBox({
        prompt: localize('Enter memory file name'),
        placeHolder: localize('my-memory.md'),
        value: 'my-memory.md',
        validateInput: (v) => v.trim() ? null : localize('File name is required'),
      });
      if (!name) return;

      // Ask for content
      const content = await vscode.window.showInputBox({
        prompt: localize('Enter memory content (optional)'),
        placeHolder: localize('# My Memory\n\nKey information...'),
        value: '',
      });

      try {
        const filePath = path.join(targetDir, name);
        const uri = vscode.Uri.file(filePath);
        await vscode.workspace.fs.writeFile(uri, Buffer.from(content || '', 'utf8'));
        provider.refresh();
        // Open the new file
        const doc = await vscode.workspace.openTextDocument(uri);
        await vscode.window.showTextDocument(doc, { preview: true });
      } catch (err) {
        vscode.window.showErrorMessage(localize('Failed to create memory: {0}', err.message));
      }
    })
  );

  // Preview in panel command
  context.subscriptions.push(
    vscode.commands.registerCommand('memoryBoard.previewInPanel', (item) => {
      const fp = item?.resourceUri?.fsPath || item?.filePath;
      if (fp) {
        previewProvider.showPreview(fp);
      }
    })
  );

  console.log('[Memory Explorer] Activated.');
}

function deactivate() {}

// ============================================================================
// Tree Item Types
// ============================================================================
const ITEM_TYPE = {
  WORKSPACE: 'workspace',
  SESSION: 'session',
  FILE: 'file',
  DIR: 'directory',
  LOADING: 'loading',
  EMPTY: 'empty',
};

class MemoryTreeItem extends vscode.TreeItem {
  constructor(label, collapsibleState, type, filePath, workspaceId, sessionId) {
    super(label, collapsibleState);
    this.type = type;
    this.filePath = filePath;
    this.workspaceId = workspaceId;
    this.sessionId = sessionId;
    this.contextValue = type;

    if (filePath) {
      this.resourceUri = vscode.Uri.file(filePath);
    }

    if (type === ITEM_TYPE.WORKSPACE) {
      this.iconPath = new vscode.ThemeIcon('database');
      this.tooltip = filePath || label;
    } else if (type === ITEM_TYPE.SESSION) {
      this.iconPath = new vscode.ThemeIcon('comment-discussion');
      this.tooltip = label;
    } else if (type === ITEM_TYPE.DIR) {
      this.iconPath = new vscode.ThemeIcon('folder');
      this.tooltip = filePath || label;
    } else if (type === ITEM_TYPE.FILE) {
      this.iconPath = new vscode.ThemeIcon(getFileIcon(label));
      this.tooltip = filePath || label;
      this.command = {
        command: 'memoryBoard.openFile',
        title: 'Open',
        arguments: [{ filePath: this.filePath }],
      };
    } else if (type === ITEM_TYPE.LOADING) {
      this.iconPath = new vscode.ThemeIcon('loading~spin');
    } else if (type === ITEM_TYPE.EMPTY) {
      this.iconPath = new vscode.ThemeIcon('inbox');
      this.tooltip = label;
    }
  }
}

function getFileIcon(name) {
  if (!name) return 'file';
  if (name.endsWith('.md')) return 'file-text';
  if (/\.(ts|js|tsx|jsx|json|css|html)$/i.test(name)) return 'file-code';
  if (/\.(png|jpg|jpeg|gif|svg|webp|bmp|ico)$/i.test(name)) return 'file-media';
  return 'file';
}

// ============================================================================
// Tree Data Provider
// ============================================================================
class MemoryTreeProvider {
  constructor(context) {
    this.context = context;
    this._parser = undefined;
    this._showAllWorkspaces = false;
    this._sortBy = 'name'; // 'name' | 'date'
    this._sortDir = 'asc'; // 'asc' | 'desc'
    this._onDidChangeTreeData = new vscode.EventEmitter();
    this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    this._cachedWorkspaces = [];
    this._cachedSessions = {};
    this._cachedEntries = {};

    // Resolve workspace storage path
    const storageUri = context.storageUri || context.globalStorageUri;
    if (storageUri) {
      const parts = storageUri.fsPath.split(path.sep).filter(p => p.length > 0);
      const wsIdx = parts.findIndex(p => p.toLowerCase() === 'workspacestorage');
      if (wsIdx >= 0 && wsIdx + 2 < parts.length) {
        const workspaceId = parts[wsIdx + 1];
        let wsPath = parts.slice(0, wsIdx + 1).join(path.sep);
        if (storageUri.fsPath.startsWith(path.sep)) wsPath = path.sep + wsPath;
        this._workspaceStoragePath = wsPath;
        this._currentWorkspaceId = workspaceId;
        this._parser = new MemoryParser(wsPath, workspaceId);
      }
    }

    // Initial load
    this.refresh();
  }

  refresh() {
    this._cachedWorkspaces = [];
    this._cachedSessions = {};
    this._cachedEntries = {};
    this._onDidChangeTreeData.fire();
  }

  cycleSort() {
    // Cycle: name-asc → name-desc → date-desc → date-asc → name-asc
    if (this._sortBy === 'name' && this._sortDir === 'asc') {
      this._sortBy = 'name'; this._sortDir = 'desc';
    } else if (this._sortBy === 'name' && this._sortDir === 'desc') {
      this._sortBy = 'date'; this._sortDir = 'desc';
    } else if (this._sortBy === 'date' && this._sortDir === 'desc') {
      this._sortBy = 'date'; this._sortDir = 'asc';
    } else {
      this._sortBy = 'name'; this._sortDir = 'asc';
    }
    this._sortCachedData();
    this._onDidChangeTreeData.fire();
  }

  _sortCachedData() {
    const dir = this._sortDir === 'asc' ? 1 : -1;

    // Sort workspaces
    this._cachedWorkspaces.sort((a, b) => {
      if (this._sortBy === 'name') {
        return dir * (a.name || '').localeCompare(b.name || '');
      } else {
        return dir * (new Date(a.lastModified || 0).getTime() - new Date(b.lastModified || 0).getTime());
      }
    });

    // Sort sessions (per workspace)
    for (const wsId of Object.keys(this._cachedSessions)) {
      this._cachedSessions[wsId].sort((a, b) => {
        if (this._sortBy === 'name') {
          return dir * (a.title || '').localeCompare(b.title || '');
        } else {
          return dir * (new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
        }
      });
    }
  }

  async getChildren(element) {
    if (!this._parser) return [this._emptyItem()];

    if (!element) {
      // Root level: directly show sessions of the current workspace
      const wsId = this._currentWorkspaceId;
      if (!wsId) return [this._emptyItem()];

      if (!this._cachedSessions[wsId]) {
        this._cachedSessions[wsId] = await this._parser.getSessionsByWorkspace(wsId);
      }
      const sessions = this._cachedSessions[wsId];

      if (sessions.length === 0) {
        return [this._emptyItem()];
      }

      // For repo session, directly show its files (no nesting)
      // For regular sessions, show as collapsible items
      const items = [];
      for (const s of sessions) {
        if (s.isRepo) {
          // Repo session: directly embed its files at root level
          const cacheKey = `${wsId}::${s.id}`;
          if (!this._cachedEntries[cacheKey]) {
            this._cachedEntries[cacheKey] = await this._parser.readMemoryContent(s.id, wsId);
          }
          const entries = this._cachedEntries[cacheKey];
          const fileItems = this._buildFileTree(entries, s.id, wsId);
          items.push(...fileItems);
        } else {
          items.push(new MemoryTreeItem(
            s.title,
            vscode.TreeItemCollapsibleState.Collapsed,
            ITEM_TYPE.SESSION,
            s.absolutePath,
            wsId,
            s.id,
          ));
        }
      }
      return items.length > 0 ? items : [this._emptyItem()];
    }

    if (element.type === ITEM_TYPE.SESSION) {
      // Files level
      const cacheKey = `${element.workspaceId}::${element.sessionId}`;
      if (!this._cachedEntries[cacheKey]) {
        this._cachedEntries[cacheKey] = await this._parser.readMemoryContent(
          element.sessionId, element.workspaceId
        );
      }
      const entries = this._cachedEntries[cacheKey];
      return this._buildFileTree(entries, element.sessionId, element.workspaceId);
    }

    if (element.type === ITEM_TYPE.DIR) {
      // Subdirectory: find children from cached entries
      const cacheKey = `${element.workspaceId}::${element.sessionId}`;
      const entries = this._cachedEntries[cacheKey] || [];
      const prefix = element._dirPrefix || element.label || '';
      const children = entries.filter(e => {
        const rel = e.relativePath;
        if (!rel.startsWith(prefix + '/')) return false;
        const rest = rel.slice(prefix.length + 1);
        return rest && !rest.includes('/');
      });
      return children.map(e => {
        if (e.isDirectory) {
          return new MemoryTreeItem(
            e.relativePath.split('/').pop(),
            vscode.TreeItemCollapsibleState.Collapsed,
            ITEM_TYPE.DIR,
            e.sourceFile,
            element.workspaceId,
            element.sessionId,
          );
        } else {
          return new MemoryTreeItem(
            e.relativePath.split('/').pop(),
            vscode.TreeItemCollapsibleState.None,
            ITEM_TYPE.FILE,
            e.sourceFile,
            element.workspaceId,
            element.sessionId,
          );
        }
      });
    }

    return [];
  }

  _buildFileTree(entries, sessionId, workspaceId) {
    if (!entries || entries.length === 0) {
      return [this._emptyItem()];
    }

    // Only show top-level items (no '/' in relativePath)
    const topLevel = entries.filter(e => {
      const rel = e.relativePath;
      return rel && !rel.includes('/');
    });

    // Also find directories that have children
    const dirNames = new Set();
    for (const e of entries) {
      const rel = e.relativePath;
      if (rel && rel.includes('/')) {
        const topDir = rel.split('/')[0];
        dirNames.add(topDir);
      }
    }

    const result = [];
    const seen = new Set();

    // Add directories first
    for (const dirName of dirNames) {
      seen.add(dirName);
      const dirEntry = entries.find(e => e.relativePath === dirName);
      const item = new MemoryTreeItem(
        dirName,
        vscode.TreeItemCollapsibleState.Collapsed,
        ITEM_TYPE.DIR,
        dirEntry ? dirEntry.sourceFile : '',
        workspaceId,
        sessionId,
      );
      item._dirPrefix = dirName;
      result.push(item);
    }

    // Add files
    for (const e of topLevel) {
      if (!seen.has(e.relativePath)) {
        result.push(new MemoryTreeItem(
          e.relativePath,
          vscode.TreeItemCollapsibleState.None,
          ITEM_TYPE.FILE,
          e.sourceFile,
          workspaceId,
          sessionId,
        ));
      }
    }

    return result.length > 0 ? result : [this._emptyItem()];
  }

  _emptyItem() {
    return new MemoryTreeItem(
      localize('No memories yet. Create one with the + button above.'),
      vscode.TreeItemCollapsibleState.None,
      ITEM_TYPE.EMPTY,
    );
  }

  getTreeItem(element) {
    return element;
  }
}

// ============================================================================
// Memory Preview Provider (WebviewView in panel)
// ============================================================================
class MemoryPreviewProvider {
  constructor(context) {
    this.context = context;
    this._view = undefined;
    this._currentFilePath = undefined;
  }

  resolveWebviewView(webviewView, context, token) {
    this._view = webviewView;
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.joinPath(this.context.extensionUri, 'media'),
      ],
    };
    // If there's a pending file to preview, show it; otherwise show empty
    if (this._currentFilePath) {
      try {
        webviewView.webview.html = this._getPreviewHtml(webviewView.webview, this._currentFilePath);
      } catch {
        webviewView.webview.html = this._getEmptyHtml(webviewView.webview);
      }
    } else {
      webviewView.webview.html = this._getEmptyHtml(webviewView.webview);
    }
  }

  showPreview(filePath) {
    this._currentFilePath = filePath;
    if (this._view) {
      this._view.webview.html = this._getPreviewHtml(this._view.webview, filePath);
      this._view.show?.(true);
    }
  }

  _getEmptyHtml(webview) {
    const nonce = getNonce();
    const emptyText = localize('Select a file in Copilot Memories to preview');
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; font-src ${webview.cspSource};">
  <title>Memory Preview</title>
  <style>
    body {
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      color: var(--vscode-sideBar-foreground);
      background: var(--vscode-sideBar-background);
      padding: 16px;
      margin: 0;
    }
    .empty {
      text-align: center;
      padding: 32px 16px;
      color: var(--vscode-descriptionForeground);
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="empty">${emptyText}</div>
</body>
</html>`;
  }

  _getPreviewHtml(webview, filePath) {
    const nonce = getNonce();
    const fs = require('fs');
    let content = '';
    let isImage = false;
    let isMarkdown = false;

    try {
      const ext = path.extname(filePath).toLowerCase();
      isImage = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.bmp', '.ico'].includes(ext);
      isMarkdown = ext === '.md';

      if (isImage) {
        // For images, we need to use webview URI
        const fileUri = vscode.Uri.file(filePath);
        const webviewUri = webview.asWebviewUri(fileUri);
        content = `<img src="${webviewUri}" style="max-width:100%;border-radius:4px;" />`;
      } else {
        content = fs.readFileSync(filePath, 'utf8');
      }
    } catch (e) {
      content = `Error reading file: ${e.message}`;
    }

    const fileName = path.basename(filePath);

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; font-src ${webview.cspSource}; img-src ${webview.cspSource} file:;">
  <title>${fileName}</title>
  <style>
    body {
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      color: var(--vscode-sideBar-foreground);
      background: var(--vscode-sideBar-background);
      padding: 16px;
      margin: 0;
      line-height: 1.6;
      overflow-x: hidden;
    }
    .file-header {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--vscode-descriptionForeground);
      padding-bottom: 8px;
      border-bottom: 1px solid var(--vscode-panel-border);
      margin-bottom: 12px;
    }
    h1 { font-size: 18px; font-weight: 600; margin: 16px 0 8px; padding-bottom: 4px; border-bottom: 1px solid var(--vscode-panel-border); }
    h2 { font-size: 15px; font-weight: 600; margin: 12px 0 6px; }
    h3 { font-size: 13px; font-weight: 600; margin: 10px 0 4px; }
    p { margin: 6px 0; }
    ul, ol { padding-left: 20px; margin: 6px 0; }
    li { margin: 2px 0; }
    code {
      font-family: var(--vscode-editor-font-family);
      font-size: 12px;
      background: var(--vscode-textCodeBlock-background);
      padding: 1px 4px;
      border-radius: 2px;
    }
    pre code {
      display: block;
      padding: 12px;
      overflow-x: auto;
      background: var(--vscode-textCodeBlock-background);
      border-radius: 4px;
      margin: 8px 0;
    }
    a { color: var(--vscode-textLink-foreground); text-decoration: none; }
    a:hover { text-decoration: underline; }
    hr { border: none; border-top: 1px solid var(--vscode-panel-border); margin: 16px 0; }
    blockquote {
      border-left: 3px solid var(--vscode-textBlockQuote-border);
      padding: 4px 12px;
      margin: 8px 0;
      color: var(--vscode-descriptionForeground);
    }
    img { max-width: 100%; border-radius: 4px; margin: 8px 0; }
  </style>
</head>
<body>
  <div class="file-header">${fileName}</div>
  ${isImage ? content : renderMarkdown(content)}
</body>
</html>`;
  }
}

function renderMarkdown(text) {
  if (!text) return '';
  let html = text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, __, code) => `<pre><code>${code.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</code></pre>`);
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  html = html.replace(/^---$/gm, '<hr>');
  html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');
  html = html.replace(/^[\s]*[-*] (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');
  html = html.replace(/^[\s]*\d+\. (.+)$/gm, '<li>$1</li>');
  html = html.replace(/\n\n/g, '</p><p>');
  html = '<p>' + html + '</p>';
  for (const tag of ['ul', 'h1', 'h2', 'h3', 'pre', 'blockquote', 'hr']) {
    html = html.replace(new RegExp(`<p><${tag}`, 'g'), `<${tag}`);
    html = html.replace(new RegExp(`</${tag}></p>`, 'g'), `</${tag}>`);
  }
  html = html.replace(/<p><li>/g, '<li>').replace(/<\/li><\/p>/g, '</li>');
  html = html.replace(/<p><\/p>/g, '');
  return html;
}

function getNonce() {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 64; i++) text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
}

module.exports = { activate, deactivate };
