/**
 * Memory Parser — reads Copilot memory files from disk.
 * Pure Node.js module, no VS Code API dependency.
 */

const fs = require('fs');
const path = require('path');

const DEFAULT_SESSION_IDS = { REPO: '_repo_' };

/**
 * Parse a chat session JSONL file to extract metadata.
 */
function parseChatSessionJsonl(content) {
  const result = { sessionId: '', createdAt: 0 };
  const lines = content.split(/\r?\n/);
  let firstUserMessage;

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed) continue;
    let line;
    try { line = JSON.parse(trimmed); } catch { continue; }

    if (line.kind === 0 && line.v && typeof line.v === 'object') {
      const snapshot = line.v;
      if (typeof snapshot.sessionId === 'string') result.sessionId = snapshot.sessionId;
      if (typeof snapshot.creationDate === 'number') result.createdAt = snapshot.creationDate;
      if (!firstUserMessage) firstUserMessage = extractFirstMessage(snapshot.requests);
    } else if (line.kind === 1 && line.k) {
      if (line.k.length === 1 && line.k[0] === 'customTitle' && typeof line.v === 'string') {
        result.customTitle = line.v;
      }
      if (!firstUserMessage && line.k.length === 2 && line.k[0] === 'inputState' && line.k[1] === 'inputText' && typeof line.v === 'string' && line.v.trim()) {
        firstUserMessage = line.v;
      }
    }
  }

  if (firstUserMessage) result.firstUserMessage = firstUserMessage;
  return result;
}

function extractFirstMessage(requests) {
  if (!Array.isArray(requests) || !requests.length) return undefined;
  const req = requests[0];
  if (!req || typeof req !== 'object') return undefined;
  const msg = req.message;
  if (typeof msg === 'string') return msg;
  if (msg && typeof msg === 'object' && typeof msg.text === 'string') return msg.text;
  return undefined;
}

function deriveTitle(meta) {
  if (!meta) return '<Untitled Session>';
  if (meta.customTitle?.trim()) return meta.customTitle.trim();
  if (meta.firstUserMessage?.trim()) {
    const oneLine = meta.firstUserMessage.replace(/\s+/g, ' ').trim();
    return oneLine.length > 80 ? oneLine.slice(0, 80) + '…' : oneLine;
  }
  return '<Untitled Session>';
}

function decodeSessionDirName(dirName) {
  let decoded;
  try { decoded = Buffer.from(dirName, 'base64').toString('utf8'); } catch { return undefined; }
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(decoded)) return undefined;
  return decoded;
}

class MemoryParser {
  constructor(basePath, currentWorkspaceId) {
    this.basePath = basePath;
    this.currentWorkspaceId = currentWorkspaceId;
  }

  getMemoriesDir(workspaceId) {
    return path.join(this.basePath, workspaceId, 'GitHub.copilot-chat', 'memory-tool', 'memories');
  }

  async scanWorkspaces() {
    const entries = await safeReaddir(this.basePath);
    const workspaces = [];
    for (const entry of entries) {
      if (entry.type !== 'directory') continue;
      if (!/^[0-9a-fA-F]+$/.test(entry.name)) continue;
      const ws = await this.tryBuildWorkspace(entry.name);
      if (ws) workspaces.push(ws);
    }
    return workspaces;
  }

  async tryBuildWorkspace(workspaceId) {
    const memoriesDir = this.getMemoriesDir(workspaceId);
    const memoriesStat = await safeStat(memoriesDir);
    if (!memoriesStat) return undefined;

    const folderUri = await this.readWorkspaceFolderUri(workspaceId);
    const folderPath = folderUri ? uriToFsPath(folderUri) : '';
    const name = folderPath ? path.basename(folderPath) : workspaceId;

    const sessions = await this.getSessionsByWorkspace(workspaceId);

    return {
      id: workspaceId,
      name,
      path: folderPath,
      sessionCount: sessions.length,
      lastModified: toIso(memoriesStat.mtime),
      createdAt: toIso(memoriesStat.birthtime || memoriesStat.ctime),
      storagePath: path.join(this.basePath, workspaceId),
    };
  }

  async readWorkspaceFolderUri(workspaceId) {
    const jsonPath = path.join(this.basePath, workspaceId, 'workspace.json');
    try {
      const raw = await fs.promises.readFile(jsonPath, 'utf8');
      const obj = JSON.parse(raw);
      return obj.folder || obj.workspace;
    } catch { return undefined; }
  }

  async getSessionsByWorkspace(workspaceId) {
    const memoriesDir = this.getMemoriesDir(workspaceId);
    if (!await pathExists(memoriesDir)) return [];

    const entries = await safeReaddir(memoriesDir);
    const sessions = [];

    for (const entry of entries) {
      if (entry.type !== 'directory') continue;

      if (entry.name === 'repo') {
        const repoPath = path.join(memoriesDir, entry.name);
        const stat = await safeStat(repoPath);
        const entryCount = await countFiles(repoPath);
        sessions.push({
          id: DEFAULT_SESSION_IDS.REPO,
          workspaceId,
          title: 'Workspace-Level Directory',
          createdAt: stat ? toIso(stat.birthtime || stat.ctime) : new Date(0).toISOString(),
          entryCount,
          isRepo: true,
          absolutePath: repoPath,
        });
        continue;
      }

      const decoded = decodeSessionDirName(entry.name);
      if (!decoded) continue;

      const sessionDir = path.join(memoriesDir, entry.name);
      const entryCount = await countFiles(sessionDir);
      const meta = await this.tryReadSessionMetadata(workspaceId, decoded);
      const dirStat = await safeStat(sessionDir);

      sessions.push({
        id: decoded,
        workspaceId,
        title: deriveTitle(meta),
        createdAt: meta?.createdAt ? new Date(meta.createdAt).toISOString() : dirStat ? toIso(dirStat.birthtime || dirStat.ctime) : new Date(0).toISOString(),
        entryCount,
        isRepo: false,
        absolutePath: sessionDir,
      });
    }

    return sessions;
  }

  async tryReadSessionMetadata(workspaceId, sessionId) {
    const jsonlPath = path.join(this.basePath, workspaceId, 'chatSessions', `${sessionId}.jsonl`);
    try {
      const content = await fs.promises.readFile(jsonlPath, 'utf8');
      return parseChatSessionJsonl(content);
    } catch { return undefined; }
  }

  async readMemoryContent(sessionId, workspaceId) {
    const sessionDir = await this.resolveSessionDir(sessionId, workspaceId);
    if (!sessionDir) return [];
    const result = [];
    await this.scanDirRecursive(sessionDir, '', sessionId, result);
    return result;
  }

  async scanDirRecursive(absoluteDir, relativeDir, sessionId, result) {
    const entries = await safeReaddir(absoluteDir);
    for (const entry of entries) {
      const relativePath = relativeDir ? `${relativeDir}/${entry.name}` : entry.name;
      const fullPath = path.join(absoluteDir, entry.name);
      const stat = await safeStat(fullPath);
      const isoTime = stat ? toIso(stat.mtime) : new Date(0).toISOString();

      if (entry.type === 'directory') {
        result.push({
          id: `${sessionId}::${relativePath}`,
          sessionId,
          content: '',
          timestamp: isoTime,
          sourceFile: fullPath,
          relativePath,
          isDirectory: true,
        });
        await this.scanDirRecursive(fullPath, relativePath, sessionId, result);
        continue;
      }

      let content = '';
      try { content = await fs.promises.readFile(fullPath, 'utf8'); } catch { continue; }

      result.push({
        id: `${sessionId}::${relativePath}`,
        sessionId,
        content,
        timestamp: isoTime,
        sourceFile: fullPath,
        relativePath,
        isDirectory: false,
      });
    }
  }

  async resolveSessionDir(sessionId, workspaceId) {
    if (!workspaceId) return undefined;
    const memoriesDir = this.getMemoriesDir(workspaceId);
    if (sessionId === DEFAULT_SESSION_IDS.REPO) {
      const repoDir = path.join(memoriesDir, 'repo');
      return await pathExists(repoDir) ? repoDir : undefined;
    }
    const entries = await safeReaddir(memoriesDir);
    for (const entry of entries) {
      if (entry.type !== 'directory') continue;
      const decoded = decodeSessionDirName(entry.name);
      if (decoded === sessionId) return path.join(memoriesDir, entry.name);
    }
    return undefined;
  }
}

// Helpers
async function safeReaddir(dir) {
  try {
    const result = await fs.promises.readdir(dir, { withFileTypes: true });
    return result.map(e => ({ name: e.name, type: e.isDirectory() ? 'directory' : 'file' }));
  } catch { return []; }
}

async function safeStat(p) {
  try { return await fs.promises.stat(p); } catch { return undefined; }
}

async function pathExists(p) {
  try { await fs.promises.access(p); return true; } catch { return false; }
}

async function countFiles(dir) {
  const entries = await safeReaddir(dir);
  let count = 0;
  for (const entry of entries) {
    if (entry.type === 'file') count++;
    else if (entry.type === 'directory') count += await countFiles(path.join(dir, entry.name));
  }
  return count;
}

function toIso(t) {
  const d = typeof t === 'number' ? new Date(t) : t;
  return d.toISOString();
}

function uriToFsPath(uri) {
  if (!uri.startsWith('file:')) return '';
  try {
    const parsed = new URL(uri);
    const pathname = decodeURIComponent(parsed.pathname);
    const isWinDrive = /^\/[a-zA-Z]:/.test(pathname);
    return (isWinDrive ? pathname.slice(1) : pathname).replace(/\//g, path.sep);
  } catch { return ''; }
}

module.exports = { MemoryParser, DEFAULT_SESSION_IDS, parseChatSessionJsonl, deriveTitle, decodeSessionDirName };
