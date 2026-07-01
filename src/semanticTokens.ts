import * as vscode from 'vscode';
import { extractHeadTail, parse } from './parser';
import { Item, Attribute } from './types';

const TOKEN_TYPES = {
  flag: 0,
  date: 1,
  time: 2,
  modifier: 3,
  attributeName: 4,
  attributeValue: 5,
  lineBeforeHead: 6,
};

const TOKEN_MODIFIERS = {
  italic: 1,
  bold: 2,
  underline: 4,
};

const LEGEND = new vscode.SemanticTokensLegend(
  ['flag', 'date', 'time', 'modifier', 'attributeName', 'attributeValue', 'lineBeforeHead'],
  ['italic', 'bold', 'underline']
);

interface HeadPart {
  text: string;
  type: number;
  modifiers?: number;
}

/**
 * Create a semantic tokens provider for chronoarchive files
 */
export function createSemanticTokensProvider(): vscode.DocumentSemanticTokensProvider & { legend: vscode.SemanticTokensLegend } {
  const provider = {
    provideDocumentSemanticTokens(document: vscode.TextDocument): vscode.SemanticTokens {
      const builder = new vscode.SemanticTokensBuilder(LEGEND);
      const content = document.getText();
      const result = parse(content);

      for (const attr of result.ast.superheader) {
        addAttributeTokens(builder, document, attr);
      }

      for (const item of result.ast.items) {
        addItemTokens(builder, document, item);
      }

      return builder.build();
    },
  };

  return { ...provider, legend: LEGEND };
}

function addAttributeTokens(
  builder: vscode.SemanticTokensBuilder,
  document: vscode.TextDocument,
  attribute: Attribute
): void {
  const line = attribute.line;
  const lineText = document.lineAt(line).text;

  const colonIndex = lineText.indexOf(':');
  if (colonIndex === -1) {
    return;
  }

  const nameText = lineText.substring(0, colonIndex).trim();
  if (nameText.length > 0) {
    const actualNameStart = lineText.indexOf(nameText);
    builder.push(line, actualNameStart, nameText.length, TOKEN_TYPES.attributeName, 0);
  }

  const valueText = lineText.substring(colonIndex + 1).trim();
  if (valueText.length > 0) {
    const actualValueStart = lineText.indexOf(valueText, colonIndex + 1);
    builder.push(line, actualValueStart, valueText.length, TOKEN_TYPES.attributeValue, 0);
  }
}

function pushHeadParts(
  builder: vscode.SemanticTokensBuilder,
  line: number,
  headText: string,
  parts: HeadPart[]
): void {
  let searchFrom = 0;
  for (const part of parts) {
    const idx = headText.indexOf(part.text, searchFrom);
    if (idx === -1) {
      continue;
    }
    builder.push(line, idx, part.text.length, part.type, part.modifiers ?? 0);
    searchFrom = idx + part.text.length;
  }
}

function headPartsForItem(item: Item, headText: string): HeadPart[] {
  const parts: HeadPart[] = [];

  for (const flag of item.flags) {
    parts.push({ text: flag, type: TOKEN_TYPES.flag });
  }
  if (item.date) {
    parts.push({ text: item.date, type: TOKEN_TYPES.date, modifiers: TOKEN_MODIFIERS.italic });
  }
  if (item.time) {
    parts.push({ text: item.time, type: TOKEN_TYPES.time });
  }
  for (const modifier of item.modifiers) {
    parts.push({ text: modifier, type: TOKEN_TYPES.modifier, modifiers: TOKEN_MODIFIERS.bold });
  }

  const tail = extractHeadTail(headText, item);
  if (tail.trim()) {
    for (const word of tail.trim().split(/\s+/)) {
      if (/^\d{2}:\d{2}(?::\d{2})?$/.test(word)) {
        parts.push({ text: word, type: TOKEN_TYPES.time });
      }
    }
  }

  return parts;
}

function addItemTokens(
  builder: vscode.SemanticTokensBuilder,
  document: vscode.TextDocument,
  item: Item
): void {
  if (item.startLine > 0) {
    const prevLine = item.startLine - 1;
    const prevText = document.lineAt(prevLine).text;
    builder.push(
      prevLine,
      0,
      Math.max(prevText.length, 1),
      TOKEN_TYPES.lineBeforeHead,
      TOKEN_MODIFIERS.underline
    );
  }

  const headText = document.lineAt(item.startLine).text;
  pushHeadParts(builder, item.startLine, headText, headPartsForItem(item, headText));

  for (const attr of item.attributes) {
    addAttributeTokens(builder, document, attr);
  }
}
