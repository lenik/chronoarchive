import * as vscode from 'vscode';
import { parse } from './parser';
import { createSemanticTokensProvider } from './semanticTokens';
import { createFoldingRangeProvider } from './folding';
import { createDiagnosticsProvider } from './diagnostics';
import { createDocumentSymbolProvider } from './symbols';
import { createCodeLensProvider, registerCodeLensCommands } from './codeLens';
import { registerItemCommands } from './itemCommands';
import { openDailyLog } from './dailyLog';

/**
 * Called when the extension is activated
 */
export function activate(context: vscode.ExtensionContext): void {
  console.log('ChronoArchive extension is now active');
  
  // Create output channel for debugging
  const outputChannel = vscode.window.createOutputChannel('ChronoArchive');
  context.subscriptions.push(outputChannel);
  
  // Register all providers
  const providers = registerProviders();
  context.subscriptions.push(...providers);
  
  // Register CodeLens commands
  const commandDisposables = registerCodeLensCommands();
  context.subscriptions.push(...commandDisposables);
  
  // Register item manipulation commands
  const itemCommandDisposables = registerItemCommands();
  context.subscriptions.push(...itemCommandDisposables);
  
  // Register daily log command (works without .car open)
  context.subscriptions.push(
    vscode.commands.registerCommand('chronoarchive.openDailyLog', openDailyLog)
  );
  
  // Register additional commands
  const generalCommands = registerGeneralCommands(outputChannel);
  context.subscriptions.push(...generalCommands);
}

/**
 * Register all language providers for chronoarchive
 */
function registerProviders(): vscode.Disposable[] {
  const disposables: vscode.Disposable[] = [];
  
  const selector: vscode.DocumentSelector = {
    language: 'chronoarchive',
    scheme: 'file',
  };
  
  // Semantic tokens provider
  const semanticTokensProvider = createSemanticTokensProvider();
  disposables.push(
    vscode.languages.registerDocumentSemanticTokensProvider(
      selector,
      semanticTokensProvider,
      semanticTokensProvider.legend
    )
  );
  
  // Folding range provider
  const foldingProvider = createFoldingRangeProvider();
  disposables.push(
    vscode.languages.registerFoldingRangeProvider(selector, foldingProvider)
  );
  
  // Diagnostics provider
  const diagnosticsCollection = createDiagnosticsProvider();
  disposables.push(diagnosticsCollection);
  
  // Document symbol provider
  const symbolProvider = createDocumentSymbolProvider();
  disposables.push(
    vscode.languages.registerDocumentSymbolProvider(selector, symbolProvider)
  );
  
  // CodeLens provider
  const codeLensProvider = createCodeLensProvider();
  disposables.push(
    vscode.languages.registerCodeLensProvider(selector, codeLensProvider)
  );
  
  return disposables;
}

/**
 * Register general commands
 */
function registerGeneralCommands(
  outputChannel: vscode.OutputChannel
): vscode.Disposable[] {
  const disposables: vscode.Disposable[] = [];
  
  // Parse current file command
  disposables.push(
    vscode.commands.registerCommand('chronoarchive.parse', () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showWarningMessage('No active editor');
        return;
      }
      
      if (editor.document.languageId !== 'chronoarchive') {
        vscode.window.showWarningMessage('Current file is not a chronoarchive file');
        return;
      }
      
      const content = editor.document.getText();
      const result = parse(content);
      
      // Show parse result in output channel
      outputChannel.show(true);
      outputChannel.clear();
      outputChannel.appendLine('=== ChronoArchive Parse Result ===\n');
      
      outputChannel.appendLine(`Superheader attributes: ${result.ast.superheader.length}`);
      for (const attr of result.ast.superheader) {
        outputChannel.appendLine(`  ${attr.name}: ${attr.value}`);
      }
      
      outputChannel.appendLine(`\nItems: ${result.ast.items.length}`);
      for (const item of result.ast.items) {
        const flags = item.flags.length > 0 ? item.flags.join(' ') : '(none)';
        const modifiers = item.modifiers.length > 0 ? item.modifiers.join(' ') : '(none)';
        outputChannel.appendLine(`\n  Item at line ${item.startLine + 1}:`);
        outputChannel.appendLine(`    Flags: ${flags}`);
        outputChannel.appendLine(`    Date: ${item.date || '(none)'}`);
        outputChannel.appendLine(`    Time: ${item.time}`);
        outputChannel.appendLine(`    Modifiers: ${modifiers}`);
        outputChannel.appendLine(`    Attributes: ${item.attributes.length}`);
        outputChannel.appendLine(`    Payload lines: ${item.payload.split('\n').length}`);
      }
      
      if (result.diagnostics.length > 0) {
        outputChannel.appendLine(`\nDiagnostics: ${result.diagnostics.length}`);
        for (const diag of result.diagnostics) {
          outputChannel.appendLine(`  [${diag.severity}] Line ${diag.line + 1}: ${diag.message}`);
        }
      }
      
      vscode.window.showInformationMessage(`Parsed ${result.ast.items.length} items. See output channel for details.`);
    })
  );
  
  // Insert new item command
  disposables.push(
    vscode.commands.registerCommand('chronoarchive.insertItem', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showWarningMessage('No active editor');
        return;
      }
      
      const position = editor.selection.active;
      const now = new Date();
      const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
      
      const snippet = new vscode.SnippetString(`✅ ${time} \${1:/prompt}\n    \${2:Enter your content here...}\n\n`);
      
      await editor.insertSnippet(snippet, position);
    })
  );
  
  // Insert current timestamp command
  disposables.push(
    vscode.commands.registerCommand('chronoarchive.insertTimestamp', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showWarningMessage('No active editor');
        return;
      }
      
      const now = new Date();
      const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
      
      await editor.edit(editBuilder => {
        editBuilder.insert(editor.selection.active, `${date} ${time}`);
      });
    })
  );
  
  return disposables;
}

/**
 * Called when the extension is deactivated
 */
export function deactivate(): void {
  console.log('ChronoArchive extension is now deactivated');
}
