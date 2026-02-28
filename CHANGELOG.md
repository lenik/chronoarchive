# Changelog

All notable changes to the ChronoArchive VS Code extension will be documented in this file.

## [1.1.0] - 2026-02-28

### Added

- **Keyboard Shortcuts** - Comprehensive keyboard shortcuts for item manipulation:
  - `Ctrl+-` - Toggle done flag (✅)
  - `Ctrl+/` - Toggle ignored flag (-)
  - `Ctrl+!` - Toggle exclamation flag (!)
  - `Ctrl+1~5` - Set priority (1-5 stars ⭐)
  - `Ctrl+Alt+Up/Down` - Move item up/down
  - `Ctrl+P` - Add item after current
  - `Ctrl+Shift+P` - Add item before current
  - `Ctrl+Alt+=` - Add item at end of file
  - `Ctrl+D` - Delete current item (with confirmation)
- **Item Commands** - New command palette commands for all keyboard shortcuts
- **Keybindings Configuration** - All shortcuts configurable in keybindings.json

## [1.0.0] - 2026-02-28

### Added

- **Initial Release** - Full language support for chronoarchive (.car) files
- **Syntax Highlighting** - Complete TextMate grammar with support for:
  - Superheader attributes
  - Item heads (flags, dates, times, modifiers)
  - Item attributes
  - Payload content with language injection
- **Semantic Tokens** - Enhanced highlighting for:
  - Flags (📝, ✅, TODO, etc.)
  - Datetime tokens
  - Modifiers (/prompt, /php, /lang=python, etc.)
  - Attribute names and values
- **Folding Ranges** - Fold individual items and superheader blocks
- **Diagnostics** - Validation for:
  - Missing time tokens in head lines
  - Empty payloads
  - Very long lines
  - Duplicate attributes
- **Document Symbols** - Outline view showing all items with:
  - Item metadata (flags, time, date)
  - Nested attribute display
  - Symbol kind detection based on flags/modifiers
- **CodeLens** - Quick actions for:
  - Running prompts (▶ Run Prompt)
  - Copying prompts to clipboard (📋 Copy)
  - Copying code blocks (📋 Copy Code)
  - Running code blocks (▶ Run Code) - for supported languages
- **Commands**:
  - `chronoarchive.parse` - Parse current file and show AST in output channel
  - `chronoarchive.insertItem` - Insert new item template at cursor
  - `chronoarchive.insertTimestamp` - Insert current date and time
  - `chronoarchive.runPrompt` - Execute a prompt item
  - `chronoarchive.copyPrompt` - Copy prompt to clipboard
  - `chronoarchive.copyCode` - Copy code block to clipboard
  - `chronoarchive.runCode` - Execute code block

### Parser Features

- Full implementation of chronoarchive format specification v1.0
- Error-tolerant parsing (unknown flags/modifiers ignored)
- Support for multiple date formats (YYYY-MM-DD, YYYY/MM/DD)
- Support for time formats (HH:MM, HH:MM:SS)
- Language detection from modifiers (/lang=xxx, /php, /python, etc.)
- Comprehensive test suite with 30+ test cases

### Technical Details

- Built with TypeScript
- No external parser dependencies
- Comprehensive unit tests
- ESLint configuration for code quality
- Debug configuration included

### Known Issues

- Code execution for CodeLens commands is not yet implemented (shows placeholder message)
- SVG icons may need to be converted to PNG for some VS Code versions

### Future Enhancements

- AI/chat panel integration for `/prompt` items
- Actual code execution for supported languages (Python, JavaScript, PHP, Bash)
- Custom theme support for semantic tokens
- Snippet completion for common patterns
- Integration with task runners
- Export to other formats (Markdown, JSON, etc.)
