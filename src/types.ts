/**
 * AST types for the chronoarchive format
 * Based on the specification section 12: Suggested AST Model
 */

/**
 * Represents a name-value attribute pair
 * Used in both superheaders and item attributes
 */
export interface Attribute {
  name: string;
  value: string;
  line: number; // 0-based line number
}

/**
 * Represents a single item in the chronoarchive file
 * Consists of: head (flags, date, time, modifiers), attributes, and payload
 */
export interface Item {
  /** Flags appearing before date/time (e.g., 📝, ✅, TODO) */
  flags: string[];
  /** Optional date (e.g., "2022-03-04") */
  date?: string;
  /** Required time (e.g., "12:34:56" or "12:34") */
  time: string;
  /** Modifiers starting with / (e.g., /prompt, /php, /lang=python) */
  modifiers: string[];
  /** Item-specific attributes (indented Name: Value pairs) */
  attributes: Attribute[];
  /** Payload content (indented block) */
  payload: string;
  /** Line number where the head starts (0-based) */
  startLine: number;
  /** Line number where the item ends (0-based, exclusive) */
  endLine: number;
}

/**
 * Represents the entire chronoarchive file
 */
export interface ChronoArchiveFile {
  /** Optional superheader attributes at the top of the file */
  superheader: Attribute[];
  /** List of items in the file */
  items: Item[];
  /** Original file content */
  content: string;
}

/**
 * Diagnostic information for validation errors
 */
export interface Diagnostic {
  /** Line number (0-based) */
  line: number;
  /** Column number (0-based) */
  column: number;
  /** Length of the problematic text */
  length: number;
  /** Error/warning message */
  message: string;
  /** Severity: "error" | "warning" | "information" | "hint" */
  severity: string;
}

/**
 * Parsed result including AST and any diagnostics
 */
export interface ParseResult {
  /** The parsed AST */
  ast: ChronoArchiveFile;
  /** Any diagnostics (errors, warnings) found during parsing */
  diagnostics: Diagnostic[];
}
