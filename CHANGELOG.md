# Change Log

## [0.1.3] - 2026-07-09

### Changed

- Migrated from vscode-nls to vscode.l10n built-in API for reliable localization
- Extension runtime translations moved from `src/extension.nls.*.json` to `l10n/bundle.l10n.*.json`

### Fixed

- Localization not working in packaged extension (vscode-nls path resolution issue)
- Delete confirmation button comparison now uses localized string

## [0.1.2] - 2026-07-09

### Added

- Internationalization: vscode-nls with 10 languages (zh-cn, ja, ko, fr, de, es, ru, pt-BR, zh-tw, it)
- Marketplace icon: white circle with Copilot + brain overlay
- README translations: 5 languages (zh-cn, ja, ko, fr, de)
- Empty state placeholder in TreeView
- Usage demo animation (docs/usage-demo.webp)

### Changed

- New activity bar icon: Copilot with brain badge
- README redesigned with logo, badges, and language switcher

### Fixed

- vscode-nls initialization failure fallback to prevent "command not found"

## [0.1.0] - 2026-07-07

### Added

- TreeView sidebar with native VS Code context menus
- Session and file browsing
- Markdown and image preview in bottom panel
- Create new memory files
- Delete memory files and sessions
- Copy path and reveal in Finder
- Sort by name or date
