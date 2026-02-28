# ChronoArchive VS Code Extension

Language support for chronoarchive (`.car`) files - a structured, line-oriented plain text format for task tracking, timestamped logging, and prompt containers.

## Features

- **Syntax Highlighting**: Full TextMate grammar support for chronoarchive format
- **Semantic Tokens**: Enhanced highlighting for flags, datetime, modifiers, and attributes
- **Folding Regions**: Fold individual items and superheader blocks
- **Diagnostics**: Validation for missing time tokens, empty payloads, and malformed items
- **Document Symbols**: Outline view showing all items in the file
- **CodeLens**: Quick actions for `/prompt` items
- **Keyboard Shortcuts**: Powerful shortcuts for item manipulation and flag management

## Installation

1. Clone this repository
2. Run `npm install`
3. Press F5 to launch the Extension Development Host
4. Open a `.car` file to see the extension in action

## Usage

Create a `.car` file and start writing structured items:

## Keyboard Shortcuts

### Flag Management

| Shortcut | Action |
|----------|--------|
| `Ctrl+-` | Toggle done flag (✅) |
| `Ctrl+/` | Toggle ignored flag (-) |
| `Ctrl+!` | Toggle exclamation flag (!) |
| `Ctrl+1` ~ `Ctrl+5` | Set priority (1-5 stars ⭐) |

### Item Navigation

| Shortcut | Action |
|----------|--------|
| `Ctrl+Alt+Up` | Move item up |
| `Ctrl+Alt+Down` | Move item down |

### Item Creation

| Shortcut | Action |
|----------|--------|
| `Ctrl+P` | Add new item after current |
| `Ctrl+Shift+P` | Add new item before current |
| `Ctrl+Alt+=` | Add new item at end of file |

### Item Deletion

| Shortcut | Action |
|----------|--------|
| `Ctrl+D` | Delete current item (with confirmation) |

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
