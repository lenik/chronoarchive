import * as vscode from 'vscode';
import { parse } from './parser';
import { Item } from './types';

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

  // Toggle ignored (add/remove -)
  disposables.push(
    vscode.commands.registerCommand('chronoarchive.toggleIgnored', async () => {
      await toggleFlag('-');
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
 * Set priority by managing star flags (⭐)
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
  
  // Remove existing star flags
  let newHeadText = headText.replace(/\s*⭐+/g, '');
  
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

  await editor.edit(editBuilder => {
    const range = new vscode.Range(item.startLine, 0, item.startLine, headLine.text.length);
    editBuilder.replace(range, newHeadText.trim());
  });
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

  // Get the text ranges to swap
  const itemStartLine = item.startLine;
  const itemEndLine = item.endLine;
  const targetStartLine = targetItem.startLine;
  const targetEndLine = targetItem.endLine;

  // Get the text of both items
  const itemText = content.split('\n').slice(itemStartLine, itemEndLine).join('\n');
  const targetText = content.split('\n').slice(targetStartLine, targetEndLine).join('\n');

  await editor.edit(editBuilder => {
    // Delete both items
    const itemRange = new vscode.Range(itemStartLine, 0, itemEndLine - 1, editor.document.lineAt(itemEndLine - 1).text.length);
    const targetRange = new vscode.Range(targetStartLine, 0, targetEndLine - 1, editor.document.lineAt(targetEndLine - 1).text.length);
    
    editBuilder.delete(itemRange);
    editBuilder.delete(targetRange);
    
    // Insert in swapped positions
    if (direction === 'up') {
      editBuilder.insert(new vscode.Position(targetStartLine, 0), itemText + '\n\n');
      editBuilder.insert(new vscode.Position(itemEndLine, 0), targetText);
    } else {
      editBuilder.insert(new vscode.Position(itemStartLine, 0), targetText + '\n\n');
      editBuilder.insert(new vscode.Position(targetEndLine, 0), itemText);
    }
  });

  // Move cursor to the item's new position
  const newPositionLine = direction === 'up' ? targetStartLine : itemStartLine;
  editor.selection = new vscode.Selection(newPositionLine, 0, newPositionLine, 0);
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
  
  let insertPosition: vscode.Position;
  let prefix = '\n';
  let suffix = '\n\n';

  if (position === 'end') {
    // Add at end of file
    const lastLine = editor.document.lineCount - 1;
    insertPosition = new vscode.Position(lastLine, editor.document.lineAt(lastLine).text.length);
    prefix = '\n\n';
    suffix = '\n';
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
      insertPosition = new vscode.Position(item.endLine - 1, editor.document.lineAt(item.endLine - 1).text.length);
    } else { // before
      insertPosition = new vscode.Position(item.startLine, 0);
      prefix = '';
      suffix = '\n\n';
    }
  }

  const snippet = new vscode.SnippetString(`${prefix}✅ ${time} \${1:/prompt}\n    \${2:Enter your content here...}${suffix}`);
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
}

/**
 * Escape special regex characters in a string
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
