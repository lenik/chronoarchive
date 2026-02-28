import * as vscode from 'vscode';
import { parse } from './parser';
import { Item } from './types';

/**
 * Create a diagnostics provider for chronoarchive files
 * Validates:
 * - Missing time token in head lines
 * - Empty payload
 * - Malformed attributes
 */
export function createDiagnosticsProvider(): vscode.DiagnosticCollection {
  const collection = vscode.languages.createDiagnosticCollection('chronoarchive');
  
  // Update diagnostics for all open documents
  function updateDiagnostics(document: vscode.TextDocument): void {
    if (document.languageId !== 'chronoarchive') {
      return;
    }
    
    const diagnostics: vscode.Diagnostic[] = [];
    const content = document.getText();
    const result = parse(content);
    
    // Add diagnostics from parser
    for (const diag of result.diagnostics) {
      const range = new vscode.Range(
        diag.line,
        diag.column,
        diag.line,
        diag.column + diag.length
      );
      
      const severity = getVscodeSeverity(diag.severity);
      const diagnostic = new vscode.Diagnostic(range, diag.message, severity);
      diagnostics.push(diagnostic);
    }
    
    // Additional validation
    validateItems(diagnostics, result.ast.items, document);
    
    collection.set(document.uri, diagnostics);
  }
  
  // Listen for document changes
  const disposables: vscode.Disposable[] = [];
  
  disposables.push(
    vscode.workspace.onDidChangeTextDocument((event) => {
      updateDiagnostics(event.document);
    })
  );
  
  disposables.push(
    vscode.workspace.onDidCloseTextDocument((document) => {
      collection.delete(document.uri);
    })
  );
  
  // Initial diagnostics for all open documents
  vscode.workspace.textDocuments.forEach(updateDiagnostics);
  
  return collection;
}

/**
 * Convert parser severity to VSCode severity
 */
function getVscodeSeverity(severity: string): vscode.DiagnosticSeverity {
  switch (severity) {
    case 'error':
      return vscode.DiagnosticSeverity.Error;
    case 'warning':
      return vscode.DiagnosticSeverity.Warning;
    case 'information':
      return vscode.DiagnosticSeverity.Information;
    case 'hint':
      return vscode.DiagnosticSeverity.Hint;
    default:
      return vscode.DiagnosticSeverity.Warning;
  }
}

/**
 * Additional validation for items
 */
function validateItems(
  diagnostics: vscode.Diagnostic[],
  items: Item[],
  document: vscode.TextDocument
): void {
  for (const item of items) {
    // Check for suspicious patterns in payload
    if (item.payload) {
      const payloadLines = item.payload.split('\n');
      
      // Check for very long lines in payload (potential formatting issue)
      for (let i = 0; i < payloadLines.length; i++) {
        const line = payloadLines[i];
        if (line.length > 500) {
          const lineNum = item.startLine + 1 + i;
          if (lineNum < document.lineCount) {
            const range = new vscode.Range(lineNum, 0, lineNum, line.length);
            diagnostics.push(
              new vscode.Diagnostic(
                range,
                'Very long line in payload. Consider breaking it into multiple lines.',
                vscode.DiagnosticSeverity.Information
              )
            );
          }
        }
      }
    }
    
    // Check for duplicate attributes
    const attributeNames = item.attributes.map((a) => a.name.toLowerCase());
    const duplicates = attributeNames.filter(
      (name, index) => attributeNames.indexOf(name) !== index
    );
    
    if (duplicates.length > 0) {
      const uniqueDuplicates = [...new Set(duplicates)];
      for (const dup of uniqueDuplicates) {
        const attr = item.attributes.find((a) => a.name.toLowerCase() === dup);
        if (attr) {
          const lineNum = attr.line;
          if (lineNum < document.lineCount) {
            const lineText = document.lineAt(lineNum).text;
            const range = new vscode.Range(lineNum, 0, lineNum, lineText.length);
            diagnostics.push(
              new vscode.Diagnostic(
                range,
                `Duplicate attribute: "${dup}"`,
                vscode.DiagnosticSeverity.Information
              )
            );
          }
        }
      }
    }
  }
}
