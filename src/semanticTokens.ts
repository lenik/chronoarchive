import * as vscode from 'vscode';
import { parse } from './parser';
import { Item, Attribute } from './types';

/**
 * Semantic token types as defined in package.json
 */
const TOKEN_TYPES = {
  flag: 0,
  datetime: 1,
  modifier: 2,
  attributeName: 3,
  attributeValue: 4,
};

const LEGEND = new vscode.SemanticTokensLegend(
  ['flag', 'datetime', 'modifier', 'attributeName', 'attributeValue'],
  []
);

/**
 * Create a semantic tokens provider for chronoarchive files
 */
export function createSemanticTokensProvider(): vscode.DocumentSemanticTokensProvider & { legend: vscode.SemanticTokensLegend } {
  const provider = {
    provideDocumentSemanticTokens(document: vscode.TextDocument): vscode.SemanticTokens {
      const builder = new vscode.SemanticTokensBuilder(LEGEND);
      const content = document.getText();
      const result = parse(content);
      
      // Add tokens for superheader attributes
      for (const attr of result.ast.superheader) {
        addAttributeTokens(builder, document, attr);
      }
      
      // Add tokens for items
      for (const item of result.ast.items) {
        addItemTokens(builder, document, item);
      }
      
      return builder.build();
    },
  };
  
  return { ...provider, legend: LEGEND };
}

/**
 * Add semantic tokens for a superheader or item attribute
 */
function addAttributeTokens(
  builder: vscode.SemanticTokensBuilder,
  document: vscode.TextDocument,
  attribute: Attribute
): void {
  const line = attribute.line;
  const lineText = document.lineAt(line).text;
  
  // Find the attribute name and value positions
  const colonIndex = lineText.indexOf(':');
  if (colonIndex === -1) {
    return;
  }
  
  // Calculate leading whitespace
  const match = lineText.match(/^\s*/);
  const leadingWhitespace = match ? match[0].length : 0;
  
  // Attribute name
  const nameStart = leadingWhitespace;
  const nameEnd = colonIndex;
  const nameText = lineText.substring(nameStart, nameEnd).trim();
  
  if (nameText.length > 0) {
    // Recalculate actual positions after trim
    const actualNameStart = lineText.indexOf(nameText);
    builder.push(line, actualNameStart, nameText.length, TOKEN_TYPES.attributeName, 0);
  }
  
  // Attribute value
  const valueText = lineText.substring(colonIndex + 1).trim();
  if (valueText.length > 0) {
    const actualValueStart = lineText.indexOf(valueText, colonIndex + 1);
    builder.push(line, actualValueStart, valueText.length, TOKEN_TYPES.attributeValue, 0);
  }
}

/**
 * Add semantic tokens for an item
 */
function addItemTokens(
  builder: vscode.SemanticTokensBuilder,
  document: vscode.TextDocument,
  item: Item
): void {
  const headLine = document.lineAt(item.startLine);
  const headText = headLine.text;
  
  // Track position as we parse the head line
  let currentPosition = 0;
  
  // Parse and add tokens for each component
  const tokens = tokenizeHeadLine(headText);
  
  for (const token of tokens) {
    const tokenStart = headText.indexOf(token.text, currentPosition);
    if (tokenStart !== -1) {
      builder.push(item.startLine, tokenStart, token.text.length, token.type, 0);
      currentPosition = tokenStart + token.text.length;
    }
  }
  
  // Add tokens for item attributes
  for (const attr of item.attributes) {
    addAttributeTokens(builder, document, attr);
  }
}

/**
 * Tokenize a head line into its components
 */
interface HeadToken {
  text: string;
  type: number;
}

function tokenizeHeadLine(headText: string): HeadToken[] {
  const tokens: HeadToken[] = [];
  
  // Regex patterns
  const timeRegex = /\b(\d{2}:\d{2}(?::\d{2})?)\b/g;
  const dateRegex = /\b(\d{4}[-/]\d{2}[-/]\d{2})\b/g;
  const modifierRegex = /(\/\S+)/g;
  
  // Find all matches
  const timeMatch = timeRegex.exec(headText);
  const dateMatch = dateRegex.exec(headText);
  
  // Reset regex for reuse
  modifierRegex.lastIndex = 0;
  
  // Split line into tokens by whitespace
  const words = headText.split(/\s+/).filter(w => w.length > 0);
  
  for (const word of words) {
    // Check if it's a modifier
    if (word.startsWith('/')) {
      tokens.push({ text: word, type: TOKEN_TYPES.modifier });
    }
    // Check if it's a date
    else if (dateMatch && word === dateMatch[1]) {
      tokens.push({ text: word, type: TOKEN_TYPES.datetime });
    }
    // Check if it's a time
    else if (timeMatch && word === timeMatch[1]) {
      tokens.push({ text: word, type: TOKEN_TYPES.datetime });
    }
    // Otherwise it's a flag
    else {
      tokens.push({ text: word, type: TOKEN_TYPES.flag });
    }
  }
  
  return tokens;
}
