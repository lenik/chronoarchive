import * as vscode from 'vscode';
import { parse } from './parser';
import { Item } from './types';

/**
 * Track the last priority key press time and value for double-press detection
 */
let lastPriorityKeyPress: { time: number; stars: number } | null = null;
const DOUBLE_PRESS_THRESHOLD_MS = 500; // Maximum time between presses to count as double-press

/**
 * Find the item that contains the given line number
 */
function findItemAtLine(items: Item[], line: number): Item | null {
  for (const item of items) {
    if (line >= item.startLine && line < item.endLine) {
      return item;
    }
  }
  return null;
}

/**
 * Register all item manipulation commands
 */
export function registerItemCommands(): vscode.Disposable[] {
  const disposables: vscode.Disposable[] = [];

  // Toggle done (add/remove ✅)
  disposables.push(
    vscode.commands.registerCommand('chronoarchive.toggleDone', async () => {
      await toggleFlag('✅');
    })
  );

  // Toggle exclamation flag
  disposables.push(
    vscode.commands.registerCommand('chronoarchive.toggleExclamation', async () => {
      await toggleFlag('!');
    })
  );

  // Set priority (1-5 stars)
  for (let i = 1; i <= 5; i++) {
    disposables.push(
      vscode.commands.registerCommand(`chronoarchive.setPriority${i}`, async () => {
        await setPriority(i);
      })
    );
  }

  // Move item up
  disposables.push(
    vscode.commands.registerCommand('chronoarchive.moveItemUp', async () => {
      await moveItem('up');
    })
  );

  // Move item down
  disposables.push(
    vscode.commands.registerCommand('chronoarchive.moveItemDown', async () => {
      await moveItem('down');
    })
  );

  // Move line up/down (exact line swap, no re-indent)
  disposables.push(
    vscode.commands.registerCommand('chronoarchive.moveLineUp', async () => {
      await moveLine('up');
    })
  );
  disposables.push(
    vscode.commands.registerCommand('chronoarchive.moveLineDown', async () => {
      await moveLine('down');
    })
  );

  // Add item after current
  disposables.push(
    vscode.commands.registerCommand('chronoarchive.addItemAfter', async () => {
      await addNewItem('after');
    })
  );

  // Add item before current
  disposables.push(
    vscode.commands.registerCommand('chronoarchive.addItemBefore', async () => {
      await addNewItem('before');
    })
  );

  // Add item at end
  disposables.push(
    vscode.commands.registerCommand('chronoarchive.addItemAtEnd', async () => {
      await addNewItem('end');
    })
  );

  // Delete current item
  disposables.push(
    vscode.commands.registerCommand('chronoarchive.deleteItem', async () => {
      await deleteCurrentItem();
    })
  );

  // Jump to next item
  disposables.push(
    vscode.commands.registerCommand('chronoarchive.jumpToNextItem', async () => {
      await jumpToItem('next');
    })
  );

  // Jump to previous item
  disposables.push(
    vscode.commands.registerCommand('chronoarchive.jumpToPreviousItem', async () => {
      await jumpToItem('previous');
    })
  );

  // Cycling toggle for Done flags
  disposables.push(
    vscode.commands.registerCommand('chronoarchive.toggleDoneCycle', async () => {
      await cycleFlag(['☑️', '✅', '🎉']);
    })
  );

  // Cycling toggle for Closed flags
  disposables.push(
    vscode.commands.registerCommand('chronoarchive.toggleClosedCycle', async () => {
      await cycleFlag(['❌', '❎', '🗑️']);
    })
  );

  // Cycling toggle for Pending flags
  disposables.push(
    vscode.commands.registerCommand('chronoarchive.togglePendingCycle', async () => {
      await cycleFlag(['🟡', '⏱️', '⌛', '🚧', '🔄', '🛠️']);
    })
  );

  // Cycling toggle for Importance flags
  disposables.push(
    vscode.commands.registerCommand('chronoarchive.toggleImportanceCycle', async () => {
      await cycleFlag(['📝', '📍', '📌']);
    })
  );

  // Cycling toggle for Attention flags
  disposables.push(
    vscode.commands.registerCommand('chronoarchive.toggleAttentionCycle', async () => {
      await cycleFlag(['⚠️', '‼️', '🔥']);
    })
  );

  // Cycling toggle for Drink flags (Ctrl+@)
  disposables.push(
    vscode.commands.registerCommand('chronoarchive.toggleDrinkCycle', async () => {
      await cycleFlag(['☕️', '🍵', '🍼', '🍻', '🍹', '🍷']);
    })
  );

  // Cycling toggle for Good emotion flags (Ctrl+))
  disposables.push(
    vscode.commands.registerCommand('chronoarchive.toggleGoodEmotionCycle', async () => {
      await cycleFlag(['💕', '🤏', '☺️', '😃', '👍', '😍', '😘']);
    })
  );

  // Cycling toggle for Bad emotion flags (Ctrl+()
  disposables.push(
    vscode.commands.registerCommand('chronoarchive.toggleBadEmotionCycle', async () => {
      await cycleFlag(['🥺', '🫩', '😂', '🤣', '😭', '😅', '💀']);
    })
  );

  return disposables;
}

/**
 * Toggle a flag in the current item's head line
 */
async function toggleFlag(flag: string): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showWarningMessage('No active editor');
    return;
  }

  if (editor.document.languageId !== 'chronoarchive') {
    vscode.window.showWarningMessage('Current file is not a chronoarchive file');
    return;
  }

  const position = editor.selection.active;
  const currentLine = position.line;
  const content = editor.document.getText();
  const result = parse(content);
  const item = findItemAtLine(result.ast.items, currentLine);

  if (!item) {
    vscode.window.showWarningMessage('Not inside a valid item');
    return;
  }

  const headLine = editor.document.lineAt(item.startLine);
  const headText = headLine.text;
  
  // Check if flag already exists
  const hasFlag = headText.includes(flag);
  
  let newHeadText: string;
  if (hasFlag) {
    // Remove flag
    newHeadText = headText.replace(new RegExp(`\\s*${escapeRegExp(flag)}\\s*`, 'g'), ' ').trim();
    // Ensure we still have a valid head line
    if (!newHeadText.match(/\d{2}:\d{2}/)) {
      vscode.window.showErrorMessage('Cannot remove flag: would invalidate head line');
      return;
    }
  } else {
    // Add flag at the beginning (after any existing flags)
    const parts = headText.split(/\s+/);
    const timeIndex = parts.findIndex(p => p.match(/^\d{2}:\d{2}/));
    if (timeIndex >= 0) {
      parts.splice(timeIndex, 0, flag);
      newHeadText = parts.join(' ');
    } else {
      newHeadText = `${flag} ${headText}`;
    }
  }

  await editor.edit(editBuilder => {
    const range = new vscode.Range(item.startLine, 0, item.startLine, headLine.text.length);
    editBuilder.replace(range, newHeadText);
  });
}

/**
 * Cycle through a list of flags in order, toggling off after the last one
 */
async function cycleFlag(flagList: string[]): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showWarningMessage('No active editor');
    return;
  }

  if (editor.document.languageId !== 'chronoarchive') {
    vscode.window.showWarningMessage('Current file is not a chronoarchive file');
    return;
  }

  const position = editor.selection.active;
  const currentLine = position.line;
  const content = editor.document.getText();
  const result = parse(content);
  const item = findItemAtLine(result.ast.items, currentLine);

  if (!item) {
    vscode.window.showWarningMessage('Not inside a valid item');
    return;
  }

  const headLine = editor.document.lineAt(item.startLine);
  let headText = headLine.text;
  
  // Find which flag from the list is currently in the head
  let currentIndex = -1;
  for (let i = 0; i < flagList.length; i++) {
    if (headText.includes(flagList[i])) {
      currentIndex = i;
      break;
    }
  }
  
  // Determine next flag (cycle or toggle off)
  let newHeadText: string;
  if (currentIndex === -1) {
    // No flag from the list exists, add the first one
    
    // Remove all known flag emoji from the head line
    // include optional U+FE0E/U+FE0F variation selectors
    const flagPattern = /[☑✅🎉❌❎🗑🟡⏱⌛🚧🔄🛠📝📍📌⚠‼🔥☕🍵🍼🍻🍹🍷💕🤏☺😃👍😍😘🥺🫩😂🤣😭😅💀][\uFE0E\uFE0F]?/gu;
    headText = headText.replace(flagPattern, '').trim();
    
    const flag = flagList[0];
    const parts = headText.split(/\s+/);
    const timeIndex = parts.findIndex(p => p.match(/^\d{2}:\d{2}/));
    if (timeIndex >= 0) {
      parts.splice(timeIndex, 0, flag);
      newHeadText = parts.join(' ');
    } else {
      newHeadText = `${flag} ${headText}`;
    }
  } else if (currentIndex === flagList.length - 1) {
    // Last flag in the list, toggle it off
    const flag = flagList[currentIndex];
    newHeadText = headText.replace(new RegExp(`\\s*${escapeRegExp(flag)}\\s*`, 'g'), ' ').trim();
    // Ensure we still have a valid head line
    if (!newHeadText.match(/\d{2}:\d{2}/)) {
      vscode.window.showErrorMessage('Cannot remove flag: would invalidate head line');
      return;
    }
  } else {
    // Replace current flag with next one in the list
    const currentFlag = flagList[currentIndex];
    const nextFlag = flagList[currentIndex + 1];
    newHeadText = headText.replace(new RegExp(`\\s*${escapeRegExp(currentFlag)}\\s*`, 'g'), ` ${nextFlag} `).trim();
  }

  await editor.edit(editBuilder => {
    const range = new vscode.Range(item.startLine, 0, item.startLine, headLine.text.length);
    editBuilder.replace(range, newHeadText);
  });
}

/**
 * Set priority by managing star flags (⭐)
 * If the same priority is pressed twice within the threshold, toggle stars off
 */
async function setPriority(stars: number): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showWarningMessage('No active editor');
    return;
  }

  if (editor.document.languageId !== 'chronoarchive') {
    vscode.window.showWarningMessage('Current file is not a chronoarchive file');
    return;
  }

  const position = editor.selection.active;
  const currentLine = position.line;
  const content = editor.document.getText();
  const result = parse(content);
  const item = findItemAtLine(result.ast.items, currentLine);

  if (!item) {
    vscode.window.showWarningMessage('Not inside a valid item');
    return;
  }

  const headLine = editor.document.lineAt(item.startLine);
  const headText = headLine.text;
  
  // Count existing stars
  const starMatch = headText.match(/⭐+/);
  const currentStars = starMatch ? starMatch[0].length : 0;
  
  // Check for double-press: same key pressed twice within threshold
  const now = Date.now();
  const isDoublePress = lastPriorityKeyPress && 
                        lastPriorityKeyPress.stars === stars && 
                        (now - lastPriorityKeyPress.time) < DOUBLE_PRESS_THRESHOLD_MS;
  
  // Update last key press tracking
  lastPriorityKeyPress = { time: now, stars };
  
  let newHeadText: string;
  
  if (isDoublePress && currentStars === stars) {
    // Toggle off: remove all stars
    newHeadText = headText.replace(/\s*⭐+/g, '').trim();
    // Clean up any extra spaces
    newHeadText = newHeadText.replace(/\s+/g, ' ').trim();
  } else {
    // Remove existing star flags
    newHeadText = headText.replace(/\s*⭐+/g, '').trim();
    
    // Add new star count if > 0
    if (stars > 0) {
      const starString = '⭐'.repeat(stars);
      const parts = newHeadText.split(/\s+/);
      const timeIndex = parts.findIndex(p => p.match(/^\d{2}:\d{2}/));
      if (timeIndex >= 0) {
        parts.splice(timeIndex, 0, starString);
        newHeadText = parts.join(' ');
      } else {
        newHeadText = `${starString} ${newHeadText}`;
      }
    }
  }

  await editor.edit(editBuilder => {
    const range = new vscode.Range(item.startLine, 0, item.startLine, headLine.text.length);
    editBuilder.replace(range, newHeadText.trim());
  });
}

/**
 * Move current line up or down by swapping with adjacent line.
 * Preserves exact line text (no re-indentation).
 */
async function moveLine(direction: 'up' | 'down'): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return;
  if (editor.document.languageId !== 'chronoarchive') return;

  const lineIndex = editor.selection.active.line;
  const doc = editor.document;
  const lineCount = doc.lineCount;
  const eol = doc.eol === vscode.EndOfLine.CRLF ? '\r\n' : '\n';

  if (direction === 'up') {
    if (lineIndex === 0) return;
    const prevLine = doc.lineAt(lineIndex - 1);
    const currLine = doc.lineAt(lineIndex);
    const range = new vscode.Range(lineIndex - 1, 0, lineIndex, currLine.text.length);
    const newText = currLine.text + eol + prevLine.text;
    await editor.edit(editBuilder => editBuilder.replace(range, newText));
    const newCursorLine = lineIndex - 1;
    const character = Math.min(editor.selection.active.character, doc.lineAt(newCursorLine).text.length);
    editor.selection = new vscode.Selection(newCursorLine, character, newCursorLine, character);
  } else {
    if (lineIndex >= lineCount - 1) return;
    const currLine = doc.lineAt(lineIndex);
    const nextLine = doc.lineAt(lineIndex + 1);
    const range = new vscode.Range(lineIndex, 0, lineIndex + 1, nextLine.text.length);
    const newText = nextLine.text + eol + currLine.text;
    await editor.edit(editBuilder => editBuilder.replace(range, newText));
    const newCursorLine = lineIndex + 1;
    const character = Math.min(editor.selection.active.character, doc.lineAt(newCursorLine).text.length);
    editor.selection = new vscode.Selection(newCursorLine, character, newCursorLine, character);
  }
}

/**
 * Move current item up or down
 */
async function moveItem(direction: 'up' | 'down'): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showWarningMessage('No active editor');
    return;
  }

  if (editor.document.languageId !== 'chronoarchive') {
    vscode.window.showWarningMessage('Current file is not a chronoarchive file');
    return;
  }

  const position = editor.selection.active;
  const currentLine = position.line;
  const content = editor.document.getText();
  const result = parse(content);
  const item = findItemAtLine(result.ast.items, currentLine);

  if (!item) {
    vscode.window.showWarningMessage('Not inside a valid item');
    return;
  }

  const items = result.ast.items;
  const currentIndex = items.indexOf(item);
  
  if (direction === 'up' && currentIndex === 0) {
    vscode.window.showInformationMessage('Already at the first item');
    return;
  }
  
  if (direction === 'down' && currentIndex === items.length - 1) {
    vscode.window.showInformationMessage('Already at the last item');
    return;
  }

  const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
  const targetItem = items[targetIndex];

  // Calculate cursor offset within the current item (relative to item start)
  const cursorOffsetInItem = position.line - item.startLine;
  const cursorChar = position.character;

  // Calculate how many lines will be in the moved item after insertion
  const blankLines = getBlankLinesConfig();

  // Use same line split as parser (/\r?\n/) so startLine/endLine indices match; preserves exact line text including indentation
  const allLines = content.split(/\r?\n/);
  const itemLines = allLines.slice(item.startLine, item.endLine);
  const targetLines = allLines.slice(targetItem.startLine, targetItem.endLine);

  if (blankLines > 0) {
    // Strip trailing blank lines from items
    while (itemLines.length > 0 && itemLines[itemLines.length - 1].trim() === '') {
        itemLines.pop();
    }
    while (targetLines.length > 0 && targetLines[targetLines.length - 1].trim() === '') {
        targetLines.pop();
    }
  }
  
  // Build new document
  let newLines: string[];
  let newItemStartLine: number;
  
  if (direction === 'up') {
    // Moving item up: [before target] + [item] + [blank lines] + [target] + [after item]
    const beforeTarget = allLines.slice(0, targetItem.startLine);
    const afterItem = allLines.slice(item.endLine);
    let afterItemClean: string[] = [];
    
    if (blankLines > 0) {
        // Strip leading blank lines from afterItem
        let afterItemStart = 0;
        while (afterItemStart < afterItem.length && afterItem[afterItemStart].trim() === '') {
          afterItemStart++;
        }
        afterItemClean = afterItem.slice(afterItemStart);
    }
    
    const blankLineArray = Array(blankLines).fill('');
    if (blankLines > 0) {
        newLines = [...beforeTarget, ...itemLines, ...blankLineArray, ...targetLines, ...afterItemClean];
    } else {
        newLines = [...beforeTarget, ...itemLines, ...blankLineArray, ...targetLines, ...afterItem];
    }
    // New item starts where target used to start
    newItemStartLine = targetItem.startLine;
  } else {
    // Moving item down: [before item] + [target] + [blank lines] + [item] + [after target]
    const beforeItem = allLines.slice(0, item.startLine);
    const afterTarget = allLines.slice(targetItem.endLine);
    let afterTargetClean: string[] = [];
    if (blankLines > 0) {
        // Strip leading blank lines from afterTarget
        let afterTargetStart = 0;
        while (afterTargetStart < afterTarget.length && afterTarget[afterTargetStart].trim() === '') {
          afterTargetStart++;
        }
        afterTargetClean = afterTarget.slice(afterTargetStart);
    }

    const blankLineArray = Array(blankLines).fill('');
    if (blankLines > 0) {
        newLines = [...beforeItem, ...targetLines, ...blankLineArray, ...itemLines, ...afterTargetClean];
    } else {
        newLines = [...beforeItem, ...targetLines, ...blankLineArray, ...itemLines, ...afterTarget];
    }
    // New item starts after beforeItem + targetLines + blankLines
    newItemStartLine = beforeItem.length + targetLines.length + blankLines;
  }
  
  const newCursorLine = newItemStartLine + cursorOffsetInItem;
  const eol = editor.document.eol === vscode.EndOfLine.CRLF ? '\r\n' : '\n';
  const newContent = newLines.join(eol);

  await editor.edit(editBuilder => {
    // Replace entire document (preserve EOL and exact line text)
    const start = new vscode.Position(0, 0);
    const end = new vscode.Position(editor.document.lineCount, 0);
    editBuilder.replace(new vscode.Range(start, end), newContent);
  });

  // Set cursor position after edit
  editor.selection = new vscode.Selection(newCursorLine, cursorChar, newCursorLine, cursorChar);
}

/**
 * Get the configured number of blank lines between items
 */
function getBlankLinesConfig(): number {
  const config = vscode.workspace.getConfiguration('chronoarchive');
  return config.get<number>('blankLinesBetweenItems', 1);
}

/**
 * Optimize blank lines between items according to user setting
 */
async function optimizeBlankLines(): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }

  const content = editor.document.getText();
  const result = parse(content);
  const blankLinesConfig = getBlankLinesConfig();
  
  // Build a map of lines to remove
  const linesToRemove: number[] = [];
  const lines = content.split('\n');
  
  // Check blank lines between items
  for (let i = 0; i < result.ast.items.length - 1; i++) {
    const currentItem = result.ast.items[i];
    const nextItem = result.ast.items[i + 1];
    
    // Count blank lines between current item end and next item start
    // currentItem.endLine is exclusive, so the last line of the item is endLine-1
    // We want to count blank lines AFTER the item, starting from endLine
    let blankCount = 0;
    const blankLinesBetween: number[] = [];
    
    for (let lineIdx = currentItem.endLine; lineIdx < nextItem.startLine; lineIdx++) {
      if (lineIdx >= 0 && lineIdx < lines.length && lines[lineIdx].trim() === '') {
        blankCount++;
        blankLinesBetween.push(lineIdx);
      }
    }
    
    // Mark extra blank lines for removal (keep only the configured amount)
    const extraBlankLines = blankCount - blankLinesConfig;
    if (extraBlankLines > 0) {
      // Remove from the end of the blank line sequence
      for (let j = 0; j < extraBlankLines && j < blankLinesBetween.length; j++) {
        const lineToRemove = blankLinesBetween[blankLinesBetween.length - 1 - j];
        if (!linesToRemove.includes(lineToRemove)) {
          linesToRemove.push(lineToRemove);
        }
      }
    }
  }
  
  // Also check blank lines after the last item
  if (result.ast.items.length > 0) {
    const lastItem = result.ast.items[result.ast.items.length - 1];
    let blankCount = 0;
    const blankLinesAfter: number[] = [];
    
    for (let lineIdx = lastItem.endLine; lineIdx < lines.length; lineIdx++) {
      if (lines[lineIdx].trim() === '') {
        blankCount++;
        blankLinesAfter.push(lineIdx);
      } else {
        break;
      }
    }
    
    // Remove extra blank lines at the end of file
    const extraBlankLines = blankCount - blankLinesConfig;
    if (extraBlankLines > 0) {
      for (let j = 0; j < extraBlankLines && j < blankLinesAfter.length; j++) {
        const lineToRemove = blankLinesAfter[blankLinesAfter.length - 1 - j];
        if (!linesToRemove.includes(lineToRemove)) {
          linesToRemove.push(lineToRemove);
        }
      }
    }
  }
  
  // Remove marked lines if any
  if (linesToRemove.length > 0) {
    linesToRemove.sort((a, b) => b - a); // Sort in reverse order
    
    await editor.edit(editBuilder => {
      for (const lineNum of linesToRemove) {
        const line = editor.document.lineAt(lineNum);
        const range = new vscode.Range(lineNum, 0, lineNum, line.text.length);
        if (lineNum < editor.document.lineCount - 1) {
          // Include the newline character
          const rangeWithNewline = new vscode.Range(lineNum, 0, lineNum + 1, 0);
          editBuilder.delete(rangeWithNewline);
        } else {
          editBuilder.delete(range);
        }
      }
    });
  }
}

/**
 * Add a new item before, after, or at end
 */
async function addNewItem(position: 'before' | 'after' | 'end'): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showWarningMessage('No active editor');
    return;
  }

  if (editor.document.languageId !== 'chronoarchive') {
    vscode.window.showWarningMessage('Current file is not a chronoarchive file');
    return;
  }

  const now = new Date();
  const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
  
  let blankLines = getBlankLinesConfig();
  if (blankLines === 0) { blankLines = 1; }

  let insertPosition: vscode.Position;
  let prefix: string;
  let suffix: string;

  if (position === 'end') {
    // Add at end of file
    // Need to ensure we're at column 0 of a new line, not continuing from indented content
    let lastLine = editor.document.lineCount - 1;
    const lastLineText = editor.document.lineAt(lastLine).text;
    
    // First, ensure the last line ends with a newline
    if (lastLineText.trim() !== '') {
      // Last line has content, append a newline to move to next line
      await editor.edit(editBuilder => {
        editBuilder.insert(new vscode.Position(lastLine, lastLineText.length), '\n');
      });
      // Now insert at column 0 of the new line
      lastLine = editor.document.lineCount - 1;
    }
    
    let existBlankLinesAtEnd = 0;
    let scanLine = lastLine - 1;
    while (scanLine >= 0 && editor.document.lineAt(scanLine).text.trim() === '') {
      scanLine--;
      existBlankLinesAtEnd++;
    }
    blankLines -= existBlankLinesAtEnd;
    if (blankLines < 0) {
      blankLines = 0;
    }

    insertPosition = new vscode.Position(lastLine, 0);
    prefix = '\n'.repeat(blankLines);
    suffix = '';
  } else {
    // Find current item
    const currentLine = editor.selection.active.line;
    const content = editor.document.getText();
    const result = parse(content);
    const item = findItemAtLine(result.ast.items, currentLine);

    if (!item) {
      vscode.window.showWarningMessage('Not inside a valid item');
      return;
    }

    if (position === 'after') {
      // Insert at the beginning of the line after the current item ends
      let lineToInsert = item.endLine;
      const doc = editor.document;
      if (lineToInsert >= doc.lineCount) {
        // Last item runs to end of file; ensure trailing newline so we insert on a new line
        const lastLineIdx = doc.lineCount - 1;
        const lastLineText = doc.lineAt(lastLineIdx).text;
        await editor.edit(editBuilder => {
          editBuilder.insert(new vscode.Position(lastLineIdx, lastLineText.length), '\n');
        });
        lineToInsert = editor.document.lineCount - 1; // new line index after the edit
      }
      insertPosition = new vscode.Position(lineToInsert, 0);
      prefix = '';
      suffix = '\n'.repeat(blankLines);
    } else { // before
      // Insert at the beginning of the current item's first line
      insertPosition = new vscode.Position(item.startLine, 0);
      prefix = ''; // New item goes first
      suffix = '\n'.repeat(blankLines); // Extra blank line after new item, then existing item
    }
  }

  // Default: no modifiers, focus on payload editing
  // New item should NOT be indented
  const snippet = new vscode.SnippetString(`${prefix}📝 ${time}\n    \${1:Enter your content here...}${suffix}\n`);
  await editor.insertSnippet(snippet, insertPosition);
}

/**
 * Delete the current item
 */
async function deleteCurrentItem(): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showWarningMessage('No active editor');
    return;
  }

  if (editor.document.languageId !== 'chronoarchive') {
    vscode.window.showWarningMessage('Current file is not a chronoarchive file');
    return;
  }

  const position = editor.selection.active;
  const currentLine = position.line;
  const content = editor.document.getText();
  const result = parse(content);
  const item = findItemAtLine(result.ast.items, currentLine);

  if (!item) {
    vscode.window.showWarningMessage('Not inside a valid item');
    return;
  }

  // Confirm deletion
  const confirm = await vscode.window.showWarningMessage(
    'Delete this item?',
    { modal: true },
    'Delete',
    'Cancel'
  );

  if (confirm !== 'Delete') {
    return;
  }

  await editor.edit(editBuilder => {
    const range = new vscode.Range(item.startLine, 0, item.endLine - 1, editor.document.lineAt(item.endLine - 1).text.length);
    editBuilder.delete(range);
  });
  
  // Optimize blank lines after deletion
  await optimizeBlankLines();
}

/**
 * Jump to next or previous item
 */
async function jumpToItem(direction: 'next' | 'previous'): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showWarningMessage('No active editor');
    return;
  }

  if (editor.document.languageId !== 'chronoarchive') {
    vscode.window.showWarningMessage('Current file is not a chronoarchive file');
    return;
  }

  const position = editor.selection.active;
  const currentLine = position.line;
  const content = editor.document.getText();
  const result = parse(content);
  const items = result.ast.items;
  
  if (items.length === 0) {
    vscode.window.showWarningMessage('No items in file');
    return;
  }
  
  // Find current item
  const currentItem = findItemAtLine(items, currentLine);
  let targetItem: Item | null = null;
  
  if (currentItem) {
    const currentIndex = items.indexOf(currentItem);
    if (direction === 'next') {
      targetItem = currentIndex < items.length - 1 ? items[currentIndex + 1] : null;
    } else {
      targetItem = currentIndex > 0 ? items[currentIndex - 1] : null;
    }
  }
  
  // If no current item or no target in that direction, go to first/last item
  if (!targetItem) {
    if (direction === 'next') {
      targetItem = items[0];
    } else {
      targetItem = items[items.length - 1];
    }
  }
  
  if (!targetItem) {
    vscode.window.showWarningMessage('No target item found');
    return;
  }
  
  // Find the first line of the payload (after head line and any attributes)
  // Payload starts after the head line and any attribute lines
  let payloadLine = targetItem.startLine + 1; // Start after head line
  
  // Skip attribute lines (they are indented and contain ":")
  while (payloadLine < targetItem.endLine) {
    const lineText = editor.document.lineAt(payloadLine).text;
    // Check if this is an attribute line (indented and contains ":")
    if (lineText.trim() === '' || (lineText.match(/^\s+/) && lineText.includes(':'))) {
      payloadLine++;
    } else {
      // This is the start of payload content
      break;
    }
  }
  
  // Find the first non-space character in the payload line
  const payloadLineText = editor.document.lineAt(payloadLine).text;
  const firstNonSpaceChar = payloadLineText.search(/\S/);
  const cursorChar = firstNonSpaceChar >= 0 ? firstNonSpaceChar : 0;
  
  // Move cursor to the first non-space character of the payload line
  editor.selection = new vscode.Selection(payloadLine, cursorChar, payloadLine, cursorChar);
  
  // Reveal the line in the viewport
  editor.revealRange(new vscode.Range(payloadLine, cursorChar, payloadLine, cursorChar), vscode.TextEditorRevealType.InCenter);
}

/**
 * Escape special regex characters in a string
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
