# Copilot Memory Explorer

Browse and manage GitHub Copilot's memory files with a native VS Code interface.

GitHub Copilot accumulates "memories" across conversations — recording your project context, coding preferences, architectural decisions, and other long-term information. These memories are stored locally as Markdown files, but there's no built-in interface to browse or manage them.

**Copilot Memory Explorer** fills that gap: it provides a native VS Code TreeView in the sidebar, letting you browse, search, and manage all Copilot memories in a two-level hierarchy: **Session → Memory Entry**.

## Features

- **Native TreeView** — Sidebar view with native VS Code context menus
- **Session Browsing** — Browse all chat sessions that have memory entries
- **File Tree** — Recursively scan session directories, showing files and subdirectories
- **Markdown Preview** — Click a file to see rendered Markdown in the bottom panel
- **Image Preview** — View images in the preview panel
- **Context Menus** — Right-click to copy path, reveal in Finder, delete, or create new memory
- **Sorting** — Toggle sort by name or date from the view title bar
- **New Memory** — Create new memory files directly from the sidebar

## Usage

1. Click the **Memory Explorer** icon in the Activity Bar
2. Browse sessions and expand to see memory files
3. Click a file to open it in the editor and preview panel
4. Right-click for context menu options

## Requirements

- VS Code 1.96+
- GitHub Copilot (for generating memories)

## Extension Settings

None currently.

## Known Issues

None.

## Release Notes

### 0.1.0

Initial release:
- TreeView sidebar with native context menus
- Session and file browsing
- Markdown and image preview in panel
- Create, delete, copy path, reveal in Finder
- Sort by name/date
