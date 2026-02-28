# ChronoArchive Attribute Specification

## Overview

Attributes in chronoarchive files are optional key-value pairs that provide metadata. There are two types of attributes:

1. **Superheader attributes** - at the file level
2. **Item attributes** - at the item level

## Superheader Attributes

Superheader attributes appear at the beginning of the file, before any items.

### Rules:
- **Optional** - files can exist without any superheader
- **Column 0** - must start from column 0 (not indented)
- **Format** - `Name: Value` (colon-separated)
- **Termination** - ended by a blank line or the first item

### Example:
```
Date: 2022-03-04
Author: Lenik
Project: ChronoArchive

📝 12:34:56
    payload content
```

## Item Attributes

Item attributes appear immediately after the item head line.

### Rules:
- **Optional** - items can exist without any attributes
- **Column 0** - must start from column 0 (not indented)
- **Format** - `Name: Value` (colon-separated)
- **Position** - must follow immediately after the header
- **No blank lines** - cannot have blank lines between header and attributes
- **Termination** - ended by a blank line or indented payload

### Example:
```
📝 12:34:56
Message-Type: Simple
Deadline: 2026-03-01 12:00:00
    message body here
```

### Important Notes:

1. **Attribute values can contain time patterns** - The parser correctly handles attribute values that contain time patterns (e.g., `Deadline: 2026-03-01 12:00:00`)

2. **Attributes vs Payload** - Attributes start at column 0, while payload is indented

3. **Attribute order** - Multiple attributes can appear in sequence, all starting at column 0

## Item Separation

Items are separated by **at least one blank line** (`\n\n`).

### Example with Multiple Items:
```
Date: 2022-03-04
Author: Lenik


📝 12:34:56
Message-Type: Simple
    first item payload

📝 12:45:00 /prompt
Priority: High
    second item payload

✅ 12:56:12 /php
    third item payload
```

## Complete Example

```
Date: 2022-03-04
Author: Lenik
Project: Test

📝 12:34:56
Message-Type: Simple
Deadline: 2026-03-01 12:00:00
    message body here

📝 12:45:00 /prompt
Priority: High
Category: Network
    write a program about weather analysis.
    
    1. Qt based
    2. Access local proxy to fetch info

✅ 12:56:12 /php
    # use this to dump connection/remote info.
    <?php
        phpinfo();
    ?>
```

## Parser Behavior

The parser follows these rules:

1. **Superheader parsing**: Reads lines starting at column 0 with `:` until blank line or item head
2. **Item attribute parsing**: Reads lines starting at column 0 with `:` immediately after head, before blank lines or payload
3. **Attribute detection**: Lines are identified as attributes if they match the pattern `Name: Value` where the colon appears before any time pattern
4. **Payload detection**: Indented content after attributes (or after head if no attributes)

## Common Mistakes to Avoid

❌ **Incorrect** - Indented attributes:
```
📝 12:34:56
    Priority: High    # WRONG - attributes should not be indented
    payload
```

✅ **Correct** - Column 0 attributes:
```
📝 12:34:56
Priority: High        # CORRECT - starts at column 0
    payload
```

❌ **Incorrect** - Blank line between header and attributes:
```
📝 12:34:56

Priority: High        # WRONG - blank line breaks attribute block
    payload
```

✅ **Correct** - No blank line:
```
📝 12:34:56
Priority: High        # CORRECT - immediately after header
    payload
```
