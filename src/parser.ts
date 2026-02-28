import { Attribute, Item, ChronoArchiveFile, ParseResult, Diagnostic } from './types';

/**
 * Regex patterns for chronoarchive format parsing
 */
const PATTERNS = {
  // Time: HH:MM or HH:MM:SS
  time: /\b(\d{2}:\d{2}(?::\d{2})?)\b/,
  
  // Date: YYYY-MM-DD or YYYY/MM/DD
  date: /\b(\d{4}[-/]\d{2}[-/]\d{2})\b/,
  
  // Modifier: starts with /
  modifier: /\/\S+/,
  
  // Attribute line: Name: Value (with optional leading whitespace)
  attribute: /^\s*(\S[^:]*?)\s*:\s*(.*)$/,
  
  // Check if line starts with whitespace (indented)
  indented: /^\s+/,
  
  // Check if line is blank (whitespace only)
  blank: /^\s*$/,
  
  // Check if line starts at column 0
  atColumnZero: /^\S/,
};

/**
 * Parse a chronoarchive file content into an AST
 * @param content - The file content as a string
 * @returns ParseResult containing the AST and any diagnostics
 */
export function parse(content: string): ParseResult {
  const lines = content.split(/\r?\n/);
  const diagnostics: Diagnostic[] = [];
  const superheader: Attribute[] = [];
  const items: Item[] = [];
  
  let currentLine = 0;
  
  // Parse superheader (attributes at column 0 before first item)
  while (currentLine < lines.length) {
    const line = lines[currentLine];
    
    // Stop at first blank line or item head
    if (PATTERNS.blank.test(line)) {
      currentLine++;
      break;
    }
    
    // Check if this is an item head (starts at column 0 with time)
    if (PATTERNS.atColumnZero.test(line) && PATTERNS.time.test(line)) {
      break;
    }
    
    // Try to parse as attribute
    if (PATTERNS.atColumnZero.test(line) && line.includes(':')) {
      const attr = parseAttributeLine(line, currentLine);
      if (attr) {
        superheader.push(attr);
      }
    }
    
    currentLine++;
  }
  
  // Skip blank lines between superheader and first item
  while (currentLine < lines.length && PATTERNS.blank.test(lines[currentLine])) {
    currentLine++;
  }
  
  // Parse items
  while (currentLine < lines.length) {
    const itemResult = parseItem(lines, currentLine, diagnostics);
    if (itemResult) {
      items.push(itemResult.item);
      currentLine = itemResult.item.endLine;
      
      // Skip blank lines between items
      while (currentLine < lines.length && PATTERNS.blank.test(lines[currentLine])) {
        currentLine++;
      }
    } else {
      // No more items, skip to end
      break;
    }
  }
  
  const ast: ChronoArchiveFile = {
    superheader,
    items,
    content,
  };
  
  return { ast, diagnostics };
}

/**
 * Parse a single item starting at the given line
 */
function parseItem(
  lines: string[],
  startLine: number,
  diagnostics: Diagnostic[]
): { item: Item } | null {
  const headLine = lines[startLine];
  
  // Validate head line
  if (!PATTERNS.atColumnZero.test(headLine)) {
    diagnostics.push({
      line: startLine,
      column: 0,
      length: headLine.length,
      message: 'Item head must start at column 0',
      severity: 'error',
    });
    return null;
  }
  
  // Parse head components
  const head = parseHeadLine(headLine, startLine, diagnostics);
  
  // Find attributes and payload
  let currentLine = startLine + 1;
  const attributes: Attribute[] = [];
  
  // Parse item attributes (indented lines with colon)
  while (currentLine < lines.length) {
    const line = lines[currentLine];
    
    // Stop at blank line or non-indented line
    if (PATTERNS.blank.test(line) || !PATTERNS.indented.test(line)) {
      break;
    }
    
    // Check if it's an attribute line
    if (line.includes(':')) {
      const attr = parseAttributeLine(line, currentLine);
      if (attr) {
        attributes.push(attr);
      }
    }
    
    currentLine++;
  }
  
  // Skip blank lines before payload
  while (currentLine < lines.length && PATTERNS.blank.test(lines[currentLine])) {
    currentLine++;
  }
  
  // Parse payload (indented block)
  const payloadLines: string[] = [];
  
  while (currentLine < lines.length) {
    const line = lines[currentLine];
    
    // Stop at non-indented, non-blank line (next item or end)
    if (line && !PATTERNS.blank.test(line) && !PATTERNS.indented.test(line)) {
      break;
    }
    
    // Stop if we hit a new item head
    if (line && PATTERNS.atColumnZero.test(line) && PATTERNS.time.test(line)) {
      break;
    }
    
    payloadLines.push(line);
    currentLine++;
  }
  
  // Remove trailing blank lines from payload
  while (payloadLines.length > 0 && PATTERNS.blank.test(payloadLines[payloadLines.length - 1])) {
    payloadLines.pop();
  }
  
  // Convert payload lines back to string, preserving indentation
  let payload = payloadLines.join('\n');
  
  // Remove common leading indentation from payload
  if (payloadLines.length > 0) {
    const minIndent = Math.min(
      ...payloadLines
        .filter(line => line.trim().length > 0)
        .map(line => line.match(/^\s*/)?.[0].length || 0)
    );
    
    if (minIndent > 0) {
      payload = payloadLines
        .map(line => line.slice(minIndent))
        .join('\n');
    }
  }
  
  // Validate payload exists
  if (!payload.trim()) {
    diagnostics.push({
      line: startLine,
      column: 0,
      length: headLine.length,
      message: 'Item must have a non-empty payload',
      severity: 'warning',
    });
  }
  
  const item: Item = {
    flags: head.flags,
    date: head.date,
    time: head.time,
    modifiers: head.modifiers,
    attributes,
    payload,
    startLine,
    endLine: currentLine,
  };
  
  return { item };
}

/**
 * Parse the head line into its components
 */
interface ParsedHead {
  flags: string[];
  date?: string;
  time: string;
  modifiers: string[];
}

function parseHeadLine(
  line: string,
  lineNum: number,
  diagnostics: Diagnostic[]
): ParsedHead {
  const flags: string[] = [];
  let date: string | undefined;
  let time = '';
  const modifiers: string[] = [];
  
  // Find time (required)
  const timeMatch = line.match(PATTERNS.time);
  if (!timeMatch) {
    diagnostics.push({
      line: lineNum,
      column: 0,
      length: line.length,
      message: 'Item head must contain a valid time (HH:MM or HH:MM:SS)',
      severity: 'error',
    });
    // Return minimal valid head to continue parsing
    return { flags, time: '', modifiers };
  }
  
  time = timeMatch[1];
  const timeIndex = timeMatch.index ?? 0;
  
  // Find date (optional, must be before time)
  const beforeTime = line.substring(0, timeIndex);
  const dateMatch = beforeTime.match(PATTERNS.date);
  if (dateMatch) {
    date = dateMatch[1];
  }
  
  // Find modifiers (tokens starting with /)
  const modifierMatches = line.match(PATTERNS.modifier);
  if (modifierMatches) {
    modifiers.push(...modifierMatches);
  }
  
  // Find flags (tokens before date/time that don't start with / and aren't date/time)
  const tokens = beforeTime.split(/\s+/).filter(t => t.length > 0);
  for (const token of tokens) {
    // Skip if it's a date
    if (PATTERNS.date.test(token)) {
      continue;
    }
    // Skip if it starts with /
    if (token.startsWith('/')) {
      continue;
    }
    // It's a flag
    flags.push(token);
  }
  
  return { flags, date, time, modifiers };
}

/**
 * Parse an attribute line (Name: Value)
 */
function parseAttributeLine(line: string, lineNum: number): Attribute | null {
  const match = line.match(PATTERNS.attribute);
  if (!match) {
    return null;
  }
  
  return {
    name: match[1].trim(),
    value: match[2].trim(),
    line: lineNum,
  };
}

/**
 * Get the language identifier from modifiers
 * Supports both /lang=xxx and shorthand like /php, /python, /json
 */
export function getLanguageFromModifiers(modifiers: string[]): string | undefined {
  for (const modifier of modifiers) {
    // Check for explicit /lang=xxx
    const langMatch = modifier.match(/^\/lang=(.+)$/);
    if (langMatch) {
      return langMatch[1];
    }
    
    // Check for shorthand language modifiers
    const shorthandLangs = ['php', 'python', 'javascript', 'js', 'typescript', 'ts', 'json', 'bash', 'shell', 'markdown', 'md', 'html', 'css', 'sql', 'go', 'rust', 'java', 'c', 'cpp', 'ruby', 'rb'];
    const modifierName = modifier.slice(1); // Remove leading /
    if (shorthandLangs.includes(modifierName)) {
      // Normalize some common aliases
      if (modifierName === 'js') { return 'javascript'; }
      if (modifierName === 'ts') { return 'typescript'; }
      if (modifierName === 'md') { return 'markdown'; }
      if (modifierName === 'shell') { return 'bash'; }
      if (modifierName === 'rb') { return 'ruby'; }
      return modifierName;
    }
  }
  
  return undefined;
}

/**
 * Check if an item has a specific modifier
 */
export function hasModifier(item: Item, modifier: string): boolean {
  return item.modifiers.includes(modifier);
}

/**
 * Get attribute value by name from item attributes
 */
export function getAttributeValue(item: Item, name: string): string | undefined {
  const attr = item.attributes.find(a => a.name.toLowerCase() === name.toLowerCase());
  return attr?.value;
}
