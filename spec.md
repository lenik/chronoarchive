Below is a **clean, implementation-oriented specification** of the `chronoarchive` format, intended for **VS Code extension developers** (syntax highlighting, parsing, LSP, diagnostics, folding, semantic tokens, etc.).

---

# ChronoArchive File Format Specification

**Format name:** `chronoarchive`
**File extension:** `.car`
**Version:** 1.0 (proposed)

---

# 1. Overview

`chronoarchive` is a structured, line-oriented plain text format designed for:

* Task tracking
* Timestamped logging
* Prompt containers
* Code or structured payload embedding
* Metadata annotation via header-style attributes

The format is:

* Human-readable
* Indentation-sensitive (for payload)
* Forward-compatible (unknown flags/modifiers MUST be ignored)

---

# 2. File Structure

A `.car` file consists of:

```
file = superheader? item*
```

Where:

* `superheader` is an optional sequence of attributes at the top of the file
* `item` is a repeatable structured block

Blank lines MAY appear anywhere and SHOULD be ignored unless inside payload.

---

# 3. Superheader

## 3.1 Definition

The superheader appears at the beginning of the file and consists of one or more attribute lines.

It ends when the first valid `item head` is encountered.

## 3.2 Syntax

```
Attribute-Name: Attribute-Value
```

### Rules

* MUST start at column 0 (no indentation)
* MUST contain a colon `:`
* Leading/trailing whitespace around name/value SHOULD be trimmed
* Multiple attributes allowed
* Attribute names are case-sensitive
* Duplicate attribute names are allowed

## 3.3 Example

```
Date: 2022-03-04
Author: Lenik
Project: ChronoArchive
```

---

# 4. Item Structure

```
item =
    head
    attribute*
    payload
```

Each item MUST contain:

1. A `head` line
2. Zero or more `attribute` lines
3. A required `payload` block (indented)

---

# 5. Head Line

## 5.1 General Form

```
[flags] [date] time [modifier*]
```

Whitespace separates tokens.

---

## 5.2 Time (REQUIRED)

A valid `time` token MUST be present.

Recommended regex:

```
\b\d{2}:\d{2}(:\d{2})?\b
```

Examples:

```
12:34
12:34:56
```

---

## 5.3 Date (OPTIONAL)

Date MAY precede time.

Recommended regex examples:

```
\b\d{4}-\d{2}-\d{2}\b
\b\d{4}/\d{2}/\d{2}\b
```

Example:

```
2022-03-04 12:34:56
```

If date is absent, only time is required.

---

## 5.4 Flags (OPTIONAL)

Flags are tokens appearing before date/time that:

* Are non-whitespace
* Do not match date/time regex
* Do not start with `/`

Examples:

```
📝
✅
⚠️
TODO
🔥
```

### Rules

* Multiple flags allowed
* Order preserved
* Unknown flags MUST be ignored by parsers
* Flags have no intrinsic semantics at spec level

---

## 5.5 Modifiers (OPTIONAL)

Modifiers are tokens starting with `/`.

```
/modifier
```

Multiple modifiers allowed.

Examples:

```
/prompt
/php
/json
/lang=markdown
```

Modifiers are opaque to the core parser and MUST be preserved.

---

## 5.6 Special Modifier: `/lang`

Used to indicate the language of the payload.

Supported forms:

```
/lang=python
/lang=markdown
/php
/json
/bash
```

Interpretation rule:

If modifier matches:

```
/<identifier>
```

It MAY be interpreted as:

```
/lang=<identifier>
```

Extension implementers MAY use this to:

* Provide language injection
* Enable embedded syntax highlighting
* Enable code execution integrations

Unknown language identifiers MUST NOT produce errors.

---

# 6. Item Attributes

Item attributes follow the head and precede payload.

## 6.1 Syntax

```
<indent>Name: Value
```

## 6.2 Rules

* MUST be indented
* MUST contain `:`
* Attribute name and value SHOULD be trimmed
* Multiple allowed
* Order preserved
* Duplicate names allowed

## 6.3 Example

```
Priority: High
Category: Network
Retry: 3
```

---

# 7. Payload

## 7.1 Definition

Payload is the indented block following:

* head
* optional item attributes

## 7.2 Rules

* MUST be indented
* Continues until:

  * A non-indented line that matches a valid `head`
  * End of file
* Payload content is preserved verbatim
* Blank lines inside payload are allowed

## 7.3 Example

```
    write a program about weather analysis.

    1. Qt based
    2. Access local proxy to fetch info
```

---

# 8. Head Detection Algorithm

To detect a head line:

1. Line MUST start at column 0
2. Line MUST contain a valid `time` token
3. Tokens after time that begin with `/` are modifiers
4. Tokens before date/time that:

   * do not start with `/`
   * do not match date/time regex
     → are flags

If no valid time token exists, the line is NOT a head.

---

# 9. Indentation Rules

* Indentation MAY be spaces or tabs
* A consistent indentation width is RECOMMENDED
* VS Code extensions SHOULD NOT enforce indentation width
* Payload indentation depth MUST be > 0

---

# 10. Error Tolerance

ChronoArchive is designed to be resilient.

Parsers MUST:

* Ignore unknown flags
* Ignore unknown modifiers
* Not fail on malformed attributes
* Treat ambiguous lines conservatively (prefer payload over head if uncertain)

---

# 11. Example File

```
Date: 2022-03-04
Author: Lenik


📝 12:34:56
    message
    this is a note


✅ 12:45:00 /prompt
    write a program about weather analysis.

    1. Qt based
    2. Access local proxy


✅ 12:56:12 /php
    <?php
        phpinfo();
    ?>
```

---

# 12. Suggested AST Model

Recommended internal representation:

```
File
 ├── superheader: Attribute[]
 └── items: Item[]

Item
 ├── flags: string[]
 ├── date?: string
 ├── time: string
 ├── modifiers: string[]
 ├── attributes: Attribute[]
 └── payload: string

Attribute
 ├── name: string
 └── value: string
```

---

# 13. VS Code Extension Recommendations

Extension authors MAY implement:

* TextMate grammar for syntax highlighting
* Language injection via `/lang`
* Folding regions per item
* Semantic tokens:

  * flags
  * datetime
  * modifiers
  * attributes
* Diagnostics for:

  * missing time in head
  * missing payload
* Outline view per item
* CodeLens for `/prompt` or executable modifiers

---

# 14. Backward Compatibility

Future versions:

* MUST preserve head detection rules
* MUST treat unknown modifiers as no-op
* MUST not change indentation-based payload logic

---

# 15. Design Principles

* Line-oriented
* Minimal grammar
* Human-first
* Machine-friendly
* Extensible without breaking old parsers

---

If desired, I can next provide:

* A TextMate grammar (tmLanguage.json)
* A Tree-sitter grammar
* A reference parser in TypeScript
* A VS Code extension scaffold structure
* LSP design guidelines for chronoarchive

