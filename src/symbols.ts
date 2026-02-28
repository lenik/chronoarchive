import * as vscode from 'vscode';
import { parse } from './parser';
import { Item } from './types';

/**
 * Create a document symbol provider for chronoarchive files
 * Provides outline view showing all items in the file
 */
export function createDocumentSymbolProvider(): vscode.DocumentSymbolProvider {
  return {
    provideDocumentSymbols(
      document: vscode.TextDocument
    ): vscode.DocumentSymbol[] | Thenable<vscode.DocumentSymbol[]> {
      const symbols: vscode.DocumentSymbol[] = [];
      const content = document.getText();
      const result = parse(content);
      
      // Add symbol for superheader if present
      if (result.ast.superheader.length > 0) {
        const firstAttr = result.ast.superheader[0];
        const lastAttr = result.ast.superheader[result.ast.superheader.length - 1];
        
        const superheaderRange = new vscode.Range(
          firstAttr.line,
          0,
          lastAttr.line,
          document.lineAt(lastAttr.line).text.length
        );
        
        const superheaderSymbol = new vscode.DocumentSymbol(
          'Superheader',
          'File-level metadata',
          vscode.SymbolKind.Module,
          superheaderRange,
          superheaderRange
        );
        
        symbols.push(superheaderSymbol);
      }
      
      // Add symbol for each item
      for (const item of result.ast.items) {
        const symbol = createItemSymbol(item, document);
        if (symbol) {
          symbols.push(symbol);
        }
      }
      
      return symbols;
    },
  };
}

/**
 * Create a document symbol for an item
 */
function createItemSymbol(
  item: Item,
  document: vscode.TextDocument
): vscode.DocumentSymbol | null {
  // Build symbol name from flags and time
  const nameParts: string[] = [];
  
  // Add flags
  if (item.flags.length > 0) {
    nameParts.push(...item.flags);
  }
  
  // Add time
  nameParts.push(item.time);
  
  // Add date if present
  if (item.date) {
    nameParts.unshift(item.date);
  }
  
  // Add modifiers as detail
  const detail = item.modifiers.length > 0 
    ? item.modifiers.join(' ')
    : 'Item';
  
  // Get first line of payload as additional detail
  const payloadFirstLine = item.payload.split('\n')[0]?.trim();
  const fullDetail = payloadFirstLine && payloadFirstLine.length < 50
    ? `${detail}: ${payloadFirstLine}`
    : detail;
  
  // Create range for the entire item
  const fullRange = new vscode.Range(
    item.startLine,
    0,
    item.endLine - 1,
    document.lineAt(item.endLine - 1)?.text.length || 0
  );
  
  // Create range for the selection (head line)
  const selectionRange = new vscode.Range(
    item.startLine,
    0,
    item.startLine,
    document.lineAt(item.startLine).text.length
  );
  
  // Determine symbol kind based on flags/modifiers
  const symbolKind = getSymbolKind(item);
  
  const symbol = new vscode.DocumentSymbol(
    nameParts.join(' '),
    fullDetail,
    symbolKind,
    fullRange,
    selectionRange
  );
  
  // Add child symbols for attributes
  if (item.attributes.length > 0) {
    const attributesParent = new vscode.DocumentSymbol(
      'Attributes',
      'Item metadata',
      vscode.SymbolKind.Property,
      fullRange,
      selectionRange
    );
    
    for (const attr of item.attributes) {
      const attrLine = document.lineAt(attr.line);
      const attrRange = new vscode.Range(
        attr.line,
        0,
        attr.line,
        attrLine.text.length
      );
      
      const attrSymbol = new vscode.DocumentSymbol(
        attr.name,
        attr.value,
        vscode.SymbolKind.Field,
        attrRange,
        attrRange
      );
      
      attributesParent.children.push(attrSymbol);
    }
    
    symbol.children.push(attributesParent);
  }
  
  return symbol;
}

/**
 * Determine the symbol kind based on item flags and modifiers
 */
function getSymbolKind(item: Item): vscode.SymbolKind {
  // Check for prompt modifier
  if (item.modifiers.includes('/prompt')) {
    return vscode.SymbolKind.Method;
  }
  
  // Check for code language modifiers
  const codeModifiers = ['/php', '/python', '/javascript', '/js', '/typescript', '/ts', '/json', '/bash', '/shell'];
  if (item.modifiers.some(m => codeModifiers.includes(m))) {
    return vscode.SymbolKind.Function;
  }
  
  // Check flags for common patterns
  const flagText = item.flags.join(' ').toLowerCase();
  
  if (flagText.includes('✅') || flagText.includes('done') || flagText.includes('complete')) {
    return vscode.SymbolKind.Event;
  }
  
  if (flagText.includes('⚠️') || flagText.includes('warning') || flagText.includes('!')) {
    return vscode.SymbolKind.Interface;
  }
  
  if (flagText.includes('📝') || flagText.includes('note') || flagText.includes('todo')) {
    return vscode.SymbolKind.String;
  }
  
  // Default
  return vscode.SymbolKind.Object;
}
