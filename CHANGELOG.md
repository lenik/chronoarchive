# Changelog

All notable changes to the **ChronoArchive** VS Code extension are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and version headings include a release timestamp (`YYYY-MM-DD HH:MM:SS ±TZ`).

## [1.1.10] - 2026-07-01 17:00:11 +0800

### Added

- Semantic highlighting: **date** italic, **modifier** bold, **line before head** underlined (including blank separator lines above item heads). TextMate grammar fallback matches the same styles. Default `editor.semanticTokenColorCustomizations` rules ship with the extension.

### Fixed

- Daily log creation with no **Daily Log Template Path**: copy from the most recent existing `.car` under `dailyLogsRoot` (scan backward from the day before the target date), then refresh `Creation`, prepend `Today is a new start! ^_^`, and roll prior items into `= backlog =`. Template path still takes priority when configured.
- Head line flag order follows `[flags] [date] time [modifier*]` — toggling/cycling flags on date-first heads (e.g. backlog `2026-06-30 15:12:15 .. 15:12:47`) no longer inserts emoji before the date.
- Centralized cycle-flag emoji lists in `src/flags.ts` (shared by toggle/cycle/priority commands).

## [1.1.9] - 2026-07-01 16:19:12 +0800

### Fixed

- Daily log creation when **Daily Log Template Path** (`chronoarchive.dailyLogTemplatePath`) points to the last-session `.car`: refresh `Creation` (including static lines without `{{CREATION}}`), prepend `Today is a new start! ^_^`, and roll prior items into a single `= backlog =` block (source date from template filename or the day before the target date).
- Built-in default template (no custom path): placeholder substitution and `Creation:` refresh only; no backlog roll-up.
- Removed mistaken auto-copy that scanned `dailyLogsRoot` for the previous or most recent calendar-day file; copy-from-last-session continues to use the configured template path only.

## [1.1.8] - 2026-06-30 21:02:18 +0800

### Added

- `CHANGELOG.md` for the VS Code Marketplace / extension **Changelog** tab (timestamped version headings).

### Fixed

- **Alt+Up / Alt+Down** (`moveLineUp` / `moveLineDown`): move the full selected line range instead of only the active line.

## [1.1.7] - 2026-04-13 14:02:14 +0800

### Added

- Localized extension UI strings (`package.nls*.json`).
- Multilingual README files (zh-CN, zh-TW, ja, ko, th, vi, and more).
- **Ctrl+Alt+D** / **Alt+Meta+D** opens today's daily log from any editor focus (not only inside `.car` files).

## [1.1.6] - 2026-04-03 20:51:18 +0800

### Changed

- Added `ovsx` dev dependency to support publishing to Open VSX.

## [1.1.5] - 2026-04-01 12:33:37 +0800

### Added

- **Alt+PageUp / Alt+PageDown**: jump to the nearest existing daily log (skip empty dates; never create files).
- **Ctrl+Alt+PageUp / Ctrl+Alt+PageDown**: open the previous / next calendar day; create from template if missing.

### Changed

- Reuse the active editor tab when switching between daily logs (if the current log is saved).

## [1.1.4] - 2026-03-23 15:21:24 +0800

### Changed

- Republish of 1.1.3 with no additional code changes.

## [1.1.3] - 2026-03-23 15:21:24 +0800

### Fixed

- Item insertion selection behavior after adding items.
- Streamlined item deletion.

## [1.1.2] - 2026-03-21 11:10:02 +0800

### Added

- **Alt+Shift+[** (`addItemBeforeCurrentLine`): insert a new item before the active line.
- ChronoArchive editor defaults: `editor.autoIndent: keep`, `editor.trimAutoWhitespace: false`.
- Dropped custom indentation rules that interfered with blank-line behavior.

### Changed

- Item shortcuts: **Alt+[** = before item, **Alt+]** = after item (was Alt+Shift+P / Alt+P).

## [1.1.1] - 2026-03-14 11:39:22 +0800

### Added

- **Alt+Up / Alt+Down**: move line up/down while preserving exact indentation.
- Daily log support: **Ctrl+Alt+D**, configurable root and custom template (`{{CREATION}}`, `{{TIME}}`).
- Flag cycling and daily-log item fixes.

### Changed

- New extension icon.

## [1.0.0] - 2026-02-28 18:56:25 +0800

### Added

- Initial release: ChronoArchive language support for `.car` files.
- Parser, syntax highlighting, folding, diagnostics, semantic tokens, CodeLens.
- Item commands: flags, navigation, insertion, deletion, move item (**Alt+J/K**).
- Cycling flag toggles and improved item navigation.
- Superheader attribute parsing; time strings allowed in attribute values.
