# Keyboard Shortcuts Reference

Quick reference card for all ChronoArchive keyboard shortcuts.

## Flag Management

| Shortcut | Command | Description |
|----------|---------|-------------|
| `Ctrl+-` | `chronoarchive.toggleDone` | Toggle done flag (✅) on/off |
| `Ctrl+/` | `chronoarchive.toggleIgnored` | Toggle ignored flag (-) on/off |
| `Ctrl+!` | `chronoarchive.toggleExclamation` | Toggle exclamation flag (!) on/off |
| `Ctrl+1` | `chronoarchive.setPriority1` | Set priority to 1 star (⭐) |
| `Ctrl+2` | `chronoarchive.setPriority2` | Set priority to 2 stars (⭐⭐) |
| `Ctrl+3` | `chronoarchive.setPriority3` | Set priority to 3 stars (⭐⭐⭐) |
| `Ctrl+4` | `chronoarchive.setPriority4` | Set priority to 4 stars (⭐⭐⭐⭐) |
| `Ctrl+5` | `chronoarchive.setPriority5` | Set priority to 5 stars (⭐⭐⭐⭐⭐) |

## Item Navigation

| Shortcut | Command | Description |
|----------|---------|-------------|
| `Ctrl+Alt+Up` | `chronoarchive.moveItemUp` | Move current item up in the file |
| `Ctrl+Alt+Down` | `chronoarchive.moveItemDown` | Move current item down in the file |

## Item Creation

| Shortcut | Command | Description |
|----------|---------|-------------|
| `Ctrl+P` | `chronoarchive.addItemAfter` | Insert new item after current item |
| `Ctrl+Shift+P` | `chronoarchive.addItemBefore` | Insert new item before current item |
| `Ctrl+Alt+=` | `chronoarchive.addItemAtEnd` | Append new item at end of file |

## Item Deletion

| Shortcut | Command | Description |
|----------|---------|-------------|
| `Ctrl+D` | `chronoarchive.deleteItem` | Delete current item (with confirmation) |

## Usage Examples

### Mark a task as done
1. Place cursor anywhere in the item
2. Press `Ctrl+-` to add ✅ flag
3. Press again to remove it

### Set priority
1. Place cursor in the item
2. Press `Ctrl+3` for 3-star priority
3. Item will show ⭐⭐⭐ in flags

### Reorder items
1. Place cursor in the item to move
2. Press `Ctrl+Alt+Up` to move up
3. Press `Ctrl+Alt+Down` to move down

### Quick add new items
- While working: `Ctrl+P` (add after current)
- At beginning: `Ctrl+Shift+P` (add before current)
- At end: `Ctrl+Alt+=` (append to file)

### Delete an item
1. Place cursor in the item
2. Press `Ctrl+D`
3. Confirm deletion in the dialog

## Customizing Shortcuts

To customize keyboard shortcuts:

1. Open Keyboard Shortcuts (File → Preferences → Keyboard Shortcuts)
2. Search for "chronoarchive"
3. Click the pencil icon next to any command
4. Press your desired key combination
5. Press Enter to save

Or edit `keybindings.json` directly:

```json
[
  {
    "key": "ctrl+shift+d",
    "command": "chronoarchive.deleteItem",
    "when": "editorTextFocus && editorLangId == chronoarchive"
  }
]
```

## Notes

- All shortcuts only work when editing `.car` files
- Cursor must be inside a valid item for most commands
- Priority stars replace existing stars (not additive)
- Flag toggles are smart (add if missing, remove if present)
- Move item commands preserve all formatting and blank lines
- Delete command shows confirmation dialog to prevent accidents
