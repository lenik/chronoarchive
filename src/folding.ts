import * as vscode from 'vscode';
import { parse } from './parser';

/**
 * Create a folding range provider for chronoarchive files
 * Provides folding for:
 * - Individual items (from head to end of payload)
 * - Superheader block (if present)
 */
export function createFoldingRangeProvider(): vscode.FoldingRangeProvider {
  return {
    provideFoldingRanges(document: vscode.TextDocument): vscode.FoldingRange[] {
      const ranges: vscode.FoldingRange[] = [];
      const content = document.getText();
      const result = parse(content);
      
      // Add folding range for superheader if it has multiple attributes
      if (result.ast.superheader.length >= 2) {
        const firstLine = result.ast.superheader[0].line;
        const lastLine = result.ast.superheader[result.ast.superheader.length - 1].line;
        
        // Only add if there are at least 2 lines to fold
        if (lastLine > firstLine) {
          ranges.push(
            new vscode.FoldingRange(firstLine, lastLine, vscode.FoldingRangeKind.Region)
          );
        }
      }
      
      // Add folding range for each item
      for (const item of result.ast.items) {
        // Item folds from the line after the head to the end of payload
        const startLine = item.startLine + 1;
        const endLine = item.endLine - 1;
        
        // Only add folding range if there's content to fold
        if (endLine > startLine) {
          ranges.push(
            new vscode.FoldingRange(startLine, endLine, vscode.FoldingRangeKind.Region)
          );
        }
      }
      
      return ranges;
    },
  };
}
