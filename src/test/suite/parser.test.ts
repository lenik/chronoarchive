import * as assert from 'assert';
import { parse, getLanguageFromModifiers, hasModifier } from '../../parser';

suite('Parser Tests', () => {
  suite('Superheader Parsing', () => {
    test('should parse superheader attributes', () => {
      const content = `Date: 2022-03-04
Author: Lenik
Project: ChronoArchive

✅ 12:34:56
    payload
`;
      const result = parse(content);
      
      assert.strictEqual(result.ast.superheader.length, 3);
      assert.strictEqual(result.ast.superheader[0].name, 'Date');
      assert.strictEqual(result.ast.superheader[0].value, '2022-03-04');
      assert.strictEqual(result.ast.superheader[1].name, 'Author');
      assert.strictEqual(result.ast.superheader[1].value, 'Lenik');
      assert.strictEqual(result.ast.superheader[2].name, 'Project');
      assert.strictEqual(result.ast.superheader[2].value, 'ChronoArchive');
    });

    test('should handle empty superheader', () => {
      const content = `✅ 12:34:56
    payload
`;
      const result = parse(content);
      
      assert.strictEqual(result.ast.superheader.length, 0);
    });

    test('should trim whitespace from attribute values', () => {
      const content = `  Name  :   Value with spaces   
✅ 12:34:56
    payload
`;
      const result = parse(content);
      
      assert.strictEqual(result.ast.superheader.length, 1);
      assert.strictEqual(result.ast.superheader[0].name, 'Name');
      assert.strictEqual(result.ast.superheader[0].value, 'Value with spaces');
    });

    test('should parse superheader attributes with time in value', () => {
      // Superheader attribute values can contain time patterns
      // The colon before time should NOT be treated as starting an item
      const content = `Date: Sat Feb 28 18:19:02 PM CST
Author: Lenik
Meeting: 2026-02-28 14:30:00

📝 09:00:00
First item with payload
`;
      const result = parse(content);
      
      assert.strictEqual(result.ast.superheader.length, 3);
      assert.strictEqual(result.ast.superheader[0].name, 'Date');
      assert.strictEqual(result.ast.superheader[0].value, 'Sat Feb 28 18:19:02 PM CST');
      assert.strictEqual(result.ast.superheader[1].name, 'Author');
      assert.strictEqual(result.ast.superheader[1].value, 'Lenik');
      assert.strictEqual(result.ast.superheader[2].name, 'Meeting');
      assert.strictEqual(result.ast.superheader[2].value, '2026-02-28 14:30:00');
      
      assert.strictEqual(result.ast.items.length, 1);
      assert.strictEqual(result.ast.items[0].time, '09:00:00');
      assert.strictEqual(result.ast.items[0].flags[0], '📝');
    });
  });

  suite('Item Head Parsing', () => {
    test('should parse time-only head', () => {
      const content = `12:34:56
    payload
`;
      const result = parse(content);
      
      assert.strictEqual(result.ast.items.length, 1);
      assert.strictEqual(result.ast.items[0].time, '12:34:56');
      assert.strictEqual(result.ast.items[0].date, undefined);
      assert.strictEqual(result.ast.items[0].flags.length, 0);
    });

    test('should parse time without seconds', () => {
      const content = `12:34
    payload
`;
      const result = parse(content);
      
      assert.strictEqual(result.ast.items.length, 1);
      assert.strictEqual(result.ast.items[0].time, '12:34');
    });

    test('should parse date and time', () => {
      const content = `2022-03-04 12:34:56
    payload
`;
      const result = parse(content);
      
      assert.strictEqual(result.ast.items.length, 1);
      assert.strictEqual(result.ast.items[0].date, '2022-03-04');
      assert.strictEqual(result.ast.items[0].time, '12:34:56');
    });

    test('should parse date with slashes', () => {
      const content = `2022/03/04 12:34:56
    payload
`;
      const result = parse(content);
      
      assert.strictEqual(result.ast.items.length, 1);
      assert.strictEqual(result.ast.items[0].date, '2022/03/04');
    });

    test('should parse flags', () => {
      const content = `📝 12:34:56
    payload
`;
      const result = parse(content);
      
      assert.strictEqual(result.ast.items.length, 1);
      assert.strictEqual(result.ast.items[0].flags.length, 1);
      assert.strictEqual(result.ast.items[0].flags[0], '📝');
    });

    test('should parse multiple flags', () => {
      const content = `TODO 📝 12:34:56
    payload
`;
      const result = parse(content);
      
      assert.strictEqual(result.ast.items.length, 1);
      assert.strictEqual(result.ast.items[0].flags.length, 2);
      assert.strictEqual(result.ast.items[0].flags[0], 'TODO');
      assert.strictEqual(result.ast.items[0].flags[1], '📝');
    });

    test('should parse modifiers', () => {
      const content = `12:34:56 /prompt
    payload
`;
      const result = parse(content);
      
      assert.strictEqual(result.ast.items.length, 1);
      assert.strictEqual(result.ast.items[0].modifiers.length, 1);
      assert.strictEqual(result.ast.items[0].modifiers[0], '/prompt');
    });

    test('should parse multiple modifiers', () => {
      const content = `12:34:56 /prompt /php
    payload
`;
      const result = parse(content);
      
      assert.strictEqual(result.ast.items.length, 1);
      assert.strictEqual(result.ast.items[0].modifiers.length, 2);
      assert.strictEqual(result.ast.items[0].modifiers[0], '/prompt');
      assert.strictEqual(result.ast.items[0].modifiers[1], '/php');
    });

    test('should parse complete head with all components', () => {
      const content = `✅ 2022-03-04 12:34:56 /prompt /php
    payload
`;
      const result = parse(content);
      
      assert.strictEqual(result.ast.items.length, 1);
      assert.strictEqual(result.ast.items[0].flags[0], '✅');
      assert.strictEqual(result.ast.items[0].date, '2022-03-04');
      assert.strictEqual(result.ast.items[0].time, '12:34:56');
      assert.strictEqual(result.ast.items[0].modifiers.length, 2);
    });

    test('should parse lang modifier', () => {
      const content = `12:34:56 /lang=python
    payload
`;
      const result = parse(content);
      
      assert.strictEqual(result.ast.items.length, 1);
      assert.strictEqual(result.ast.items[0].modifiers[0], '/lang=python');
    });
  });

  suite('Item Attributes Parsing', () => {
    test('should parse item attributes', () => {
      // Attributes must start at column 0, immediately after header, no blank lines
      const content = `✅ 12:34:56
Priority: High
Category: Network
    payload content
`;
      const result = parse(content);
      
      assert.strictEqual(result.ast.items.length, 1);
      assert.strictEqual(result.ast.items[0].attributes.length, 2);
      assert.strictEqual(result.ast.items[0].attributes[0].name, 'Priority');
      assert.strictEqual(result.ast.items[0].attributes[0].value, 'High');
      assert.strictEqual(result.ast.items[0].attributes[1].name, 'Category');
      assert.strictEqual(result.ast.items[0].attributes[1].value, 'Network');
    });

    test('should handle empty attributes', () => {
      const content = `✅ 12:34:56
    payload
`;
      const result = parse(content);
      
      assert.strictEqual(result.ast.items.length, 1);
      assert.strictEqual(result.ast.items[0].attributes.length, 0);
    });
    
    test('should parse attributes with time in value', () => {
      // Attribute values can contain time patterns
      const content = `📝 12:34:56
Deadline: 2026-03-01 12:00:00
    message body
`;
      const result = parse(content);
      
      assert.strictEqual(result.ast.items.length, 1);
      assert.strictEqual(result.ast.items[0].attributes.length, 1);
      assert.strictEqual(result.ast.items[0].attributes[0].name, 'Deadline');
      assert.strictEqual(result.ast.items[0].attributes[0].value, '2026-03-01 12:00:00');
      assert.strictEqual(result.ast.items[0].payload.trim(), 'message body');
    });
  });

  suite('Payload Parsing', () => {
    test('should parse single-line payload', () => {
      const content = `12:34:56
    simple payload
`;
      const result = parse(content);
      
      assert.strictEqual(result.ast.items.length, 1);
      assert.strictEqual(result.ast.items[0].payload, 'simple payload');
    });

    test('should parse multi-line payload', () => {
      const content = `12:34:56
    line 1
    line 2
    line 3
`;
      const result = parse(content);
      
      assert.strictEqual(result.ast.items.length, 1);
      assert.strictEqual(result.ast.items[0].payload, 'line 1\nline 2\nline 3');
    });

    test('should preserve payload indentation', () => {
      const content = `12:34:56
    indented content
        more indented
    back to normal
`;
      const result = parse(content);
      
      assert.strictEqual(result.ast.items.length, 1);
      const payload = result.ast.items[0].payload;
      assert.ok(payload.includes('indented content'));
      assert.ok(payload.includes('more indented'));
    });

    test('should handle blank lines in payload', () => {
      const content = `12:34:56
    line 1

    line 3
`;
      const result = parse(content);
      
      assert.strictEqual(result.ast.items.length, 1);
      assert.strictEqual(result.ast.items[0].payload, 'line 1\n\nline 3');
    });

    test('should parse payload with code', () => {
      const content = `12:34:56 /php
    <?php
        phpinfo();
    ?>
`;
      const result = parse(content);
      
      assert.strictEqual(result.ast.items.length, 1);
      const payload = result.ast.items[0].payload;
      assert.ok(payload.includes('<?php'));
      assert.ok(payload.includes('phpinfo();'));
      assert.ok(payload.includes('?>'));
    });
  });

  suite('Multiple Items', () => {
    test('should parse multiple items', () => {
      const content = `Date: 2022-03-04

📝 12:34:56
    first item

✅ 12:45:00 /prompt
    second item

✅ 12:56:12 /php
    third item
`;
      const result = parse(content);
      
      assert.strictEqual(result.ast.items.length, 3);
      assert.strictEqual(result.ast.items[0].time, '12:34:56');
      assert.strictEqual(result.ast.items[1].time, '12:45:00');
      assert.strictEqual(result.ast.items[2].time, '12:56:12');
    });

    test('should track line numbers correctly', () => {
      const content = `Date: 2022-03-04

📝 12:34:56
    payload
`;
      const result = parse(content);
      
      assert.strictEqual(result.ast.items.length, 1);
      assert.strictEqual(result.ast.items[0].startLine, 2); // 0-indexed
    });
  });

  suite('Language Detection', () => {
    test('should detect language from /lang= modifier', () => {
      const content = `12:34:56 /lang=python
    code
`;
      const result = parse(content);
      const lang = getLanguageFromModifiers(result.ast.items[0].modifiers);
      
      assert.strictEqual(lang, 'python');
    });

    test('should detect language from shorthand modifiers', () => {
      const testCases = [
        { modifier: '/php', expected: 'php' },
        { modifier: '/python', expected: 'python' },
        { modifier: '/javascript', expected: 'javascript' },
        { modifier: '/js', expected: 'javascript' },
        { modifier: '/typescript', expected: 'typescript' },
        { modifier: '/ts', expected: 'typescript' },
        { modifier: '/json', expected: 'json' },
        { modifier: '/bash', expected: 'bash' },
        { modifier: '/shell', expected: 'bash' },
        { modifier: '/markdown', expected: 'markdown' },
        { modifier: '/md', expected: 'markdown' },
      ];

      for (const testCase of testCases) {
        const content = `12:34:56 ${testCase.modifier}
    code
`;
        const result = parse(content);
        const lang = getLanguageFromModifiers(result.ast.items[0].modifiers);
        assert.strictEqual(lang, testCase.expected, `Failed for modifier ${testCase.modifier}`);
      }
    });
  });

  suite('Helper Functions', () => {
    test('should check for modifier existence', () => {
      const content = `12:34:56 /prompt /php
    code
`;
      const result = parse(content);
      const item = result.ast.items[0];
      
      assert.ok(hasModifier(item, '/prompt'));
      assert.ok(hasModifier(item, '/php'));
      assert.ok(!hasModifier(item, '/python'));
    });
  });

  suite('Error Tolerance', () => {
    test('should ignore unknown flags', () => {
      const content = `UNKNOWN_FLAG 12:34:56
    payload
`;
      const result = parse(content);
      
      assert.strictEqual(result.ast.items.length, 1);
      assert.strictEqual(result.ast.items[0].flags[0], 'UNKNOWN_FLAG');
    });

    test('should ignore unknown modifiers', () => {
      const content = `12:34:56 /unknown-modifier
    payload
`;
      const result = parse(content);
      
      assert.strictEqual(result.ast.items.length, 1);
      assert.strictEqual(result.ast.items[0].modifiers[0], '/unknown-modifier');
    });

    test('should handle duplicate attributes', () => {
      // Attributes must start at column 0
      const content = `✅ 12:34:56
Tag: first
Tag: second
    payload
`;
      const result = parse(content);
      
      assert.strictEqual(result.ast.items.length, 1);
      assert.strictEqual(result.ast.items[0].attributes.length, 2);
    });
  });

  suite('Example File', () => {
    test('should parse the example file from spec', () => {
      const content = `Date: 2022-03-04
Author: Lenik


📝 12:34:56
Message-Type: Simple
Deadline: 2026-03-01 12:00:00
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
`;
      const result = parse(content);
      
      assert.strictEqual(result.ast.superheader.length, 2);
      assert.strictEqual(result.ast.items.length, 3);
      
      // First item
      assert.strictEqual(result.ast.items[0].flags[0], '📝');
      assert.strictEqual(result.ast.items[0].time, '12:34:56');
      assert.strictEqual(result.ast.items[0].attributes.length, 2);
      assert.strictEqual(result.ast.items[0].attributes[0].name, 'Message-Type');
      assert.strictEqual(result.ast.items[0].attributes[1].name, 'Deadline');
      assert.ok(result.ast.items[0].payload.includes('this is a note'));
      
      // Second item
      assert.strictEqual(result.ast.items[1].flags[0], '✅');
      assert.strictEqual(result.ast.items[1].time, '12:45:00');
      assert.ok(hasModifier(result.ast.items[1], '/prompt'));
      assert.ok(result.ast.items[1].payload.includes('weather analysis'));
      
      // Third item
      assert.strictEqual(result.ast.items[2].flags[0], '✅');
      assert.strictEqual(result.ast.items[2].time, '12:56:12');
      assert.ok(hasModifier(result.ast.items[2], '/php'));
      assert.ok(result.ast.items[2].payload.includes('phpinfo();'));
    });
  });
});
