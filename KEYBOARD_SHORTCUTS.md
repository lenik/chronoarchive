# Keyboard Shortcuts Reference

Quick reference card for all ChronoArchive keyboard shortcuts.

## Flag Management

### Cycling Flags

These shortcuts cycle through multiple flag variants in order, toggling off after the last one.

| Shortcut | Command | Flag Cycle | Description |
|----------|---------|------------|-------------|
| `Ctrl+-/ | `chronoarchive.toggleDoneCycle` | ☑️ → ✅ → 🎉 → (off) | Cycle Done flags |
| `Ctrl+'` | `chronoarchive.toggleClosedCycle` | ❌ → ❎ → 🗑️ → (off) | Cycle Closed flags |
| `Ctrl+Shift+/` | `chronoarchive.togglePendingCycle` | 🟡 → ⏱️ → ⌛ → 🚧 → 🔄 → 🛠️ → (off) | Cycle Pending flags |
| `Ctrl+Shift+\` | `chronoarchive.toggleImportanceCycle` | 📝 → 📍 → 📌 → (off) | Cycle Importance flags |
| `Ctrl+Shift+'` | `chronoarchive.toggleAttentionCycle` | ⚠️ → ‼️ → 🔥 → (off) | Cycle Attention flags |
| `Ctrl+@` | `chronoarchive.toggleDrinkCycle` | ☕️ → 🍵 → 🍼 → 🍻 → 🍹 → 🍷 → (off) | Cycle Drink flags |
| `Ctrl+)` | `chronoarchive.toggleGoodEmotionCycle` | 💕 → 🤏 → ☺️ → 😃 → 👍 → 😍 → 😘 → (off) | Cycle Good emotion flags |
| `Ctrl+(` | `chronoarchive.toggleBadEmotionCycle` | 🥺 → 🫩 → 😂 → 🤣 → 😭 → 😅 → 💀 → (off) | Cycle Bad emotion flags |

### Single Toggle Flags

| Shortcut | Command | Description |
|----------|---------|-------------|
| `Ctrl+1` | `chronoarchive.setPriority1` | Set priority to 1 star (⭐) |
| `Ctrl+2` | `chronoarchive.setPriority2` | Set priority to 2 stars (⭐⭐) |
| `Ctrl+3` | `chronoarchive.setPriority3` | Set priority to 3 stars (⭐⭐⭐) |
| `Ctrl+4` | `chronoarchive.setPriority4` | Set priority to 4 stars (⭐⭐⭐⭐) |
| `Ctrl+5` | `chronoarchive.setPriority5` | Set priority to 5 stars (⭐⭐⭐⭐⭐) |

**Notes:**
- **Double-Press Toggle:** Press the same priority key (Ctrl+1 through Ctrl+5) twice quickly to toggle stars off completely.
- **Cycling Behavior:** Press cycling shortcuts repeatedly to advance through the flag sequence. After the last flag, the next press toggles all flags off.

## Item Navigation

| Shortcut | Command | Description |
|----------|---------|-------------|
| `Alt+K` | `chronoarchive.moveItemUp` | Move current item up in the file |
| `Alt+J` | `chronoarchive.moveItemDown` | Move current item down in the file |
| `Ctrl+Alt+Up` | `chronoarchive.moveItemUp` | Move current item up (alternative) |
| `Ctrl+Alt+Down` | `chronoarchive.moveItemDown` | Move current item down (alternative) |
| `Ctrl+K` | `chronoarchive.jumpToPreviousItem` | Jump to previous item (cursor at payload) |
| `Ctrl+J` | `chronoarchive.jumpToNextItem` | Jump to next item (cursor at payload) |

**Note:** 
- The Ctrl+Alt+Up/Down shortcuts are designed to override system settings when editing chronoarchive files.
- Jump commands (Ctrl+K/J) place the cursor at the beginning of the payload section for immediate editing.

## Daily Logs

| Shortcut | Command | Description |
|----------|---------|-------------|
| `Ctrl+Alt+D` | `chronoarchive.openDailyLog` | Create and open today's daily log file |

The file is created at `<dailyLogsRoot>/YEAR/YEAR-MONTH/YEAR-MONTH-DAY.car`. If it already exists, it is opened. In Settings → ChronoArchive: set **Daily Logs Root** (empty = platform default) and **Daily Log Template Path** (empty = built-in template; or path to a file with `{{CREATION}}` and `{{TIME}}` placeholders).

## Item Creation

| Shortcut | Command | Description |
|----------|---------|-------------|
| `Ctrl+P` | `chronoarchive.addItemAfter` | Insert new item after current item |
| `Ctrl+Shift+P` | `chronoarchive.addItemBefore` | Insert new item before current item |
| `Ctrl+Alt+=` | `chronoarchive.addItemAtEnd` | Append new item at end of file |

## Item Deletion

| Shortcut | Command | Description |
|----------|---------|-------------|
| `Ctrl+Shift+Delete` | `chronoarchive.deleteItem` | Delete current item (with confirmation) |

## Usage Examples

### Cycle through Done flags
1. Place cursor in the item
2. Press `Ctrl+-/ to cycle: ☑️ → ✅ → 🎉 → (off)
3. Each press advances to the next flag
4. After the last flag (🎉), press again to toggle off

### Cycle through other flag types
- **Closed:** `Ctrl+'` cycles through ❌ → ❎ → 🗑️ → (off)
- **Pending:** `Ctrl+Shift+/` cycles through 🟡 → ⏱️ → ⌛ → 🚧 → 🔄 → 🛠️ → (off)
- **Importance:** `Ctrl+Shift+\` cycles through 📝 → 📍 → 📌 → (off)
- **Attention:** `Ctrl+Shift+'` cycles through ⚠️ → ‼️ → 🔥 → (off)
- **Drink:** `Ctrl+@` cycles through ☕️ → 🍵 → 🍼 → 🍻 → 🍹 → 🍷 → (off)
- **Good emotion:** `Ctrl+)` cycles through 💕 → 🤏 → ☺️ → 😃 → 👍 → 😍 → 😘 → (off)
- **Bad emotion:** `Ctrl+(` cycles through 🥺 → 🫩 → 😂 → 🤣 → 😭 → 😅 → 💀 → (off)

### Set priority
1. Place cursor in the item
2. Press `Ctrl+3` for 3-star priority
3. Item will show ⭐⭐⭐ in flags

### Reorder items
1. Place cursor in the item to move
2. Press `Alt+K` to move up
3. Press `Alt+J` to move down

### Quick add new items
- While working: `Ctrl+P` (add after current)
- At beginning: `Ctrl+Shift+P` (add before current)
- At end: `Ctrl+Alt+=` (append to file)

### Delete an item
1. Place cursor in the item
2. Press `Ctrl+Delete`
3. Confirm deletion in the dialog

### Jump between items
1. Press `Ctrl+J` to jump to next item
2. Press `Ctrl+K` to jump to previous item
3. Cursor lands at the payload for immediate editing

## Settings

ChronoArchive provides configurable settings to customize behavior:

### Blank Lines Between Items

**Setting:** `chronoarchive.blankLinesBetweenItems`  
**Default:** `1`  
**Range:** `0-3`

Controls the number of blank lines preserved between items. Extra blank lines beyond this setting will be automatically removed when inserting or deleting items.

To change this setting:

1. Open Settings (File → Preferences → Settings)
2. Search for "chronoarchive"
3. Find "Blank Lines Between Items"
4. Set your preferred value (0-3)

### Daily Logs Root

**Setting:** `chronoarchive.dailyLogsRoot`  
**Default:** (empty = platform default)

Root folder for daily log files. Path: `<root>/YEAR/YEAR-MONTH/YEAR-MONTH-DAY.car`.

- **Linux:** `XDG_DOCUMENTS_DIR/Daily Logs/` or `~/Documents/Daily Logs/`
- **Windows:** `%USERPROFILE%\Documents\Daily Logs`
- **Custom:** Set to any absolute path or path relative to home (e.g. `~/Notes/Daily`). Use `~` for home directory.

### Daily Log Template Path

**Setting:** `chronoarchive.dailyLogTemplatePath`  
**Default:** (empty = built-in default template)

Path to a custom template file used when creating a new daily log. The file can use placeholders `{{CREATION}}` (replaced with a full date/time string) and `{{TIME}}` (replaced with `HH:MM:SS`). Leave blank to use the extension’s default template.

Or edit `settings.json` directly:

```json
{
  "chronoarchive.blankLinesBetweenItems": 2,
  "chronoarchive.dailyLogsRoot": "~/Documents/Daily Logs",
  "chronoarchive.dailyLogTemplatePath": "~/templates/daily.car"
}
```

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
- **Double-press the same priority key (Ctrl+1-5) to toggle stars off**
- Flag toggles are smart (add if missing, remove if present)
- Move item commands preserve cursor position within the content
- Move item commands optimize blank lines according to settings
- Delete command shows confirmation dialog to prevent accidents
- **New items are created with empty modifiers and focus on payload editing**
- **Blank lines between items are configurable** (see Settings below)
- **Jump commands (Ctrl+K/J) navigate between items and position cursor at payload start**
