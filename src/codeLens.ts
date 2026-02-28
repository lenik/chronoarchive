import * as vscode from 'vscode';
import { parse, hasModifier, getLanguageFromModifiers } from './parser';
import { Item } from './types';

/**
 * Create a CodeLens provider for chronoarchive files
 * Provides quick actions for:
 * - /prompt items (run prompt, copy to clipboard)
 * - Code blocks (run code, copy code)
 */
export function createCodeLensProvider(): vscode.CodeLensProvider {
  return {
    provideCodeLenses(document: vscode.TextDocument): vscode.CodeLens[] | Thenable<vscode.CodeLens[]> {
      const lenses: vscode.CodeLens[] = [];
      const content = document.getText();
      const result = parse(content);
      
      for (const item of result.ast.items) {
        // Add lenses for /prompt items
        if (hasModifier(item, '/prompt')) {
          addPromptLenses(lenses, document, item);
        }
        
        // Add lenses for code blocks
        const language = getLanguageFromModifiers(item.modifiers);
        if (language) {
          addCodeLenses(lenses, document, item, language);
        }
      }
      
      return lenses;
    },
  };
}

/**
 * Add CodeLenses for prompt items
 */
function addPromptLenses(
  lenses: vscode.CodeLens[],
  document: vscode.TextDocument,
  item: Item
): void {
  const range = new vscode.Range(item.startLine, 0, item.startLine, 0);
  
  // Run prompt lens
  lenses.push(
    new vscode.CodeLens(range, {
      title: '▶ Run Prompt',
      tooltip: 'Execute this prompt',
      command: 'chronoarchive.runPrompt',
      arguments: [item.payload, item.startLine],
    })
  );
  
  // Copy prompt lens
  lenses.push(
    new vscode.CodeLens(range, {
      title: '📋 Copy',
      tooltip: 'Copy prompt to clipboard',
      command: 'chronoarchive.copyPrompt',
      arguments: [item.payload],
    })
  );
}

/**
 * Add CodeLenses for code blocks
 */
function addCodeLenses(
  lenses: vscode.CodeLens[],
  document: vscode.TextDocument,
  item: Item,
  language: string
): void {
  const range = new vscode.Range(item.startLine, 0, item.startLine, 0);
  
  // Copy code lens
  lenses.push(
    new vscode.CodeLens(range, {
      title: '📋 Copy Code',
      tooltip: `Copy ${language} code to clipboard`,
      command: 'chronoarchive.copyCode',
      arguments: [item.payload, language],
    })
  );
  
  // Run code lens for supported languages
  if (['python', 'javascript', 'bash', 'php'].includes(language)) {
    lenses.push(
      new vscode.CodeLens(range, {
        title: '▶ Run Code',
        tooltip: `Execute ${language} code`,
        command: 'chronoarchive.runCode',
        arguments: [item.payload, language, item.startLine],
      })
    );
  }
}

/**
 * Register CodeLens commands
 */
export function registerCodeLensCommands(): vscode.Disposable[] {
  const disposables: vscode.Disposable[] = [];
  
  // Run prompt command
  disposables.push(
    vscode.commands.registerCommand('chronoarchive.runPrompt', async (payload: string, line: number) => {
      vscode.window.showInformationMessage(`Running prompt from line ${line + 1}...\n\nPayload:\n${payload.substring(0, 200)}${payload.length > 200 ? '...' : ''}`);
      // TODO: Integrate with AI/chat panel
    })
  );
  
  // Copy prompt command
  disposables.push(
    vscode.commands.registerCommand('chronoarchive.copyPrompt', async (payload: string) => {
      await vscode.env.clipboard.writeText(payload);
      vscode.window.showInformationMessage('Prompt copied to clipboard!');
    })
  );
  
  // Copy code command
  disposables.push(
    vscode.commands.registerCommand('chronoarchive.copyCode', async (payload: string, language: string) => {
      await vscode.env.clipboard.writeText(payload);
      vscode.window.showInformationMessage(`${language} code copied to clipboard!`);
    })
  );
  
  // Run code command
  disposables.push(
    vscode.commands.registerCommand('chronoarchive.runCode', async (payload: string, language: string, line: number) => {
      // Show output channel
      const outputChannel = vscode.window.createOutputChannel(`ChronoArchive: ${language}`);
      outputChannel.show(true);
      outputChannel.appendLine(`Running ${language} code from line ${line + 1}...`);
      outputChannel.appendLine('---');
      outputChannel.appendLine(payload);
      outputChannel.appendLine('---');
      
      // TODO: Actually execute code based on language
      // For now, just show info message
      vscode.window.showInformationMessage(
        `${language} code execution not yet implemented. Code is shown in output panel.`
      );
    })
  );
  
  return disposables;
}
