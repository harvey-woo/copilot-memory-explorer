<p align="center">
  <img src="media/marketplace-icon.png" alt="Logo" width="128" />
</p>

<h1 align="center">Copilot Memory Explorer</h1>

<p align="center">
  <a href="https://marketplace.visualstudio.com/items?itemName=cat5th.copilot-memory-explorer">
    <img src="https://img.shields.io/badge/VS%20Code-1.96%2B-blue?logo=visualstudiocode" alt="VS Code" />
  </a>
  <a href="LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-green" alt="License" />
  </a>
  <a href="https://github.com/harvey-woo/copilot-memory-explorer">
    <img src="https://img.shields.io/github/stars/harvey-woo/copilot-memory-explorer?style=social" alt="Stars" />
  </a>
  <br/>
  <a href="README.zh-cn.md">中文</a> ·
  <a href="README.ja.md">日本語</a> ·
  <a href="README.ko.md">한국어</a> ·
  <a href="README.fr.md">Français</a> ·
  <a href="README.de.md">Deutsch</a>
</p>

Browse and manage GitHub Copilot's memory files with a native VS Code interface.

GitHub Copilot accumulates "memories" across conversations — recording your project context, coding preferences, architectural decisions, and other long-term information. These memories are stored locally as Markdown files, but there's no built-in interface to browse or manage them.

**Copilot Memory Explorer** fills that gap: it provides a native VS Code sidebar view, letting you browse and manage all Copilot memories organized by chat session.

## Demo

<p align="center">
  <img src="docs/usage-demo.webp" alt="Usage Demo" width="720" />
</p>

## Features

- **Native TreeView** — Sidebar view with native VS Code context menus
- **Session Browsing** — Browse all chat sessions that have memory entries
- **File Tree** — Recursively scan session directories, showing files and subdirectories
- **Markdown Preview** — Click a file to see rendered Markdown in the preview panel
- **Image Preview** — View images in the preview panel
- **Context Menus** — Right-click to copy path, reveal in Finder, delete, or create new memory
- **Sorting** — Toggle sort by name or date from the view title bar
- **New Memory** — Create new memory files directly from the sidebar

## Usage

1. Click the **Copilot Memories** icon in the Activity Bar
2. Browse sessions and expand to see memory files
3. Click a file to open it in the editor and preview panel
4. Right-click for context menu options

## Requirements

- VS Code 1.96+
- GitHub Copilot (for generating memories)

## Release Notes

See [CHANGELOG.md](CHANGELOG.md) for version history.

## License

[MIT](LICENSE)
