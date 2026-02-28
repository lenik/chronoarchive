# ChronoArchive VS Code Extension

Language support for chronoarchive (`.car`) files - a structured, line-oriented plain text format for task tracking, timestamped logging, and prompt containers.

## Features

- **Syntax Highlighting**: Full TextMate grammar support for chronoarchive format
- **Semantic Tokens**: Enhanced highlighting for flags, datetime, modifiers, and attributes
- **Folding Regions**: Fold individual items and superheader blocks
- **Diagnostics**: Validation for missing time tokens, empty payloads, and malformed items
- **Document Symbols**: Outline view showing all items in the file
- **CodeLens**: Quick actions for `/prompt` items
- **Keyboard Shortcuts**: Comprehensive shortcuts for flag cycling, item navigation, and manipulation
- **Smart Item Movement**: Preserve cursor position when moving items
- **Auto-Optimization**: Automatically manage blank lines between items

## Installation

1. Clone this repository
2. Run `npm install`
3. Press F5 to launch the Extension Development Host
4. Open a `.car` file to see the extension in action

## Usage

Create a `.car` file and start writing structured items:

## Keyboard Shortcuts

### Cycling Flags

Press repeatedly to cycle through flag variants. After the last flag, the next press toggles off.

| Shortcut | Flag Cycle | Description |
|----------|------------|-------------|
| `Ctrl+/` | ☑️ → ✅ → 🎉 → off | Cycle Done flags |
| `Ctrl+'` | ❌ → ❎ → 🗑️ → off | Cycle Closed flags |
| `Ctrl+Shift+/` | 🟡 → ⏱️ → ⌛ → 🚧 → 🔄 → 🛠️ → off | Cycle Pending flags |
| `Ctrl+Shift+\` | 📝 → 📍 → 📌 → off | Cycle Importance flags |
| `Ctrl+Shift+'` | ⚠️ → ‼️ → 🔥 → off | Cycle Attention flags |

### Single Toggle Flags

| Shortcut | Action |
|----------|--------|
| `Ctrl+1` ~ `Ctrl+5` | Set priority (1-5 stars ⭐) |

### Item Navigation

| Shortcut | Action |
|----------|--------|
| `Ctrl+K` | Jump to previous item (cursor at payload) |
| `Ctrl+J` | Jump to next item (cursor at payload) |
| `Alt+K` | Move item up |
| `Alt+J` | Move item down |

### Item Creation

| Shortcut | Action |
|----------|--------|
| `Ctrl+P` | Add new item after current |
| `Ctrl+Shift+P` | Add new item before current |
| `Ctrl+Alt+=` | Add new item at end of file |

### Item Deletion

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+Delete` | Delete current item (with confirmation) |

### Configuration

| Setting | Default | Description |
|---------|---------|-------------|
| `chronoarchive.blankLinesBetweenItems` | `1` | Number of blank lines between items (0-3) |

## Quick Start

```todo
Date: 2022-03-04
Author: Lenik

📝 12:34:56
    This is a note item

✅ 12:45:00 /prompt
    Write a program about weather analysis.

    1. Qt based
    2. Access local proxy

✅ 12:56:12 /php
    <?php
        phpinfo();
    ?>
```

## Example

### Superheader

Optional attributes at the top of the file:

```todo
Date: 2022-03-04
Author: Lenik
Project: ChronoArchive
```

### Item Structure

Each item consists of:

1. **Head line** (required): `[flags] [date] time [modifiers]`
2. **Attributes** (optional): Indented `Name: Value` pairs
3. **Payload** (required): Indented content block

### Head Line Components

- **Flags** (optional): Emoji or text markers (📝, ✅, TODO, etc.)
- **Date** (optional): `YYYY-MM-DD` or `YYYY/MM/DD`
- **Time** (required): `HH:MM` or `HH:MM:SS`
- **Modifiers** (optional): `/prompt`, `/php`, `/lang=python`, etc.

### Modifiers

- `/prompt` - Marks item as a prompt
- `/php`, `/python`, `/json`, etc. - Language hints
- `/lang=identifier` - Explicit language specification

## Development

### Build

```bash
npm run compile
```

### Watch Mode

```bash
npm run watch
```

### Run Tests

```bash
npm test
```

## License

GPL
