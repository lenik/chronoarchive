import * as assert from 'assert';
import {
  applyDailyLogTemplate,
  buildCopiedDailyLogContent,
  getDailyLogContentFromTemplate,
  isSameCalendarDate,
  parseCreationCalendarDate,
  parseCreationCalendarDateFromContent,
} from '../../dailyLogCopy';

suite('Daily Log Copy Tests', () => {
  test('parseCreationCalendarDate ignores time and timezone', () => {
    const date = parseCreationCalendarDate('Wed Mar 14 12:54:33 PM CST 2026');
    assert.ok(date);
    if (!date) {
      return;
    }
    assert.strictEqual(date.getFullYear(), 2026);
    assert.strictEqual(date.getMonth(), 2);
    assert.strictEqual(date.getDate(), 14);

    const otherTime = parseCreationCalendarDate('Wed Mar 14 09:00:00 AM CST 2026');
    assert.ok(otherTime);
    if (!otherTime) {
      return;
    }
    assert.ok(isSameCalendarDate(date, otherTime));
  });

  test('parseCreationCalendarDateFromContent reads superheader Creation', () => {
    const content = `Title: Test
Type: Daily Logs
Creation: Sun Jun 29 09:00:00 AM CST 2026

📝 09:00:00
    hello
`;
    const parsed = parseCreationCalendarDateFromContent(content);
    assert.ok(parsed);
    if (!parsed) {
      return;
    }
    assert.strictEqual(parsed.getFullYear(), 2026);
    assert.strictEqual(parsed.getMonth(), 5);
    assert.strictEqual(parsed.getDate(), 29);
  });

  test('parseCreationCalendarDate returns null without year', () => {
    assert.strictEqual(parseCreationCalendarDate('Thu May 28 12:54:33 PM CST'), null);
  });

  test('refreshes static Creation line in built-in template', () => {
    const template = `Title: Test
Type: Daily Logs
Creation: Thu May 28 12:54:33 PM CST

📝 09:00:00
    hello
`;
    const now = new Date(2026, 6, 1, 9, 30, 0);
    const result = applyDailyLogTemplate(template, now);

    assert.doesNotMatch(result, /Creation: Thu May 28/);
    assert.match(result, /^Creation: /m);
    assert.ok(result.includes('📝 09:00:00'));
  });

  test('updates Creation and rolls prior items into backlog', () => {
    const source = `Title: Having_fun_with_ChronoArchive
Type: Daily Logs
Creation: Sun Jun 29 09:00:00 AM CST 2026

📝 09:00:00
    line 1
    line 2

⏱️ 14:30:00
    line 3
`;
    const sourceDate = new Date(2026, 5, 29);
    const now = new Date(2026, 5, 30, 10, 15, 30);

    const result = buildCopiedDailyLogContent(source, sourceDate, now);

    assert.match(result, /^Title: Having_fun_with_ChronoArchive\nType: Daily Logs\nCreation: /);
    assert.doesNotMatch(result, /Creation: Sun Jun 29/);
    assert.ok(result.includes('📝 10:15:30\n    Today is a new start! ^_^'));
    assert.ok(result.includes('2026-06-29 09:00:00 .. 14:30:00'));
    assert.ok(result.includes('    = backlog =\n\n    line 1\n    line 2\n\n    line 3\n'));
  });

  test('handles source with no items', () => {
    const source = `Title: Test
Creation: Sun Jun 29 09:00:00 AM CST 2026

`;
    const sourceDate = new Date(2026, 5, 29);
    const now = new Date(2026, 5, 30, 8, 0, 0);

    const result = buildCopiedDailyLogContent(source, sourceDate, now);

    assert.match(result, /Creation: /);
    assert.doesNotMatch(result, /Creation: Sun Jun 29/);
    assert.ok(result.includes('📝 08:00:00\n    Today is a new start! ^_^'));
    assert.doesNotMatch(result, /= backlog =/);
  });

  test('custom template path uses copy transform with backlog', () => {
    const source = `Title: Test
Creation: Thu May 28 12:54:33 PM CST

📝 09:00:00
    line 1

⏱️ 14:30:00
    line 2
`;
    const targetDate = new Date(2026, 5, 30);
    const now = new Date(2026, 5, 30, 10, 0, 0);
    const result = getDailyLogContentFromTemplate(
      source,
      '/logs/2026/2026-05/2026-05-29.car',
      targetDate,
      now
    );

    assert.doesNotMatch(result, /Creation: Thu May 28/);
    assert.ok(result.includes('Today is a new start! ^_^'));
    assert.ok(result.includes('2026-05-29 09:00:00 .. 14:30:00'));
    assert.ok(result.includes('= backlog ='));
    assert.ok(result.includes('line 1'));
    assert.ok(result.includes('line 2'));
  });

  test('built-in template does not archive into backlog', () => {
    const template = `Title: Test
Creation: {{CREATION}}

📝 {{TIME}}
    hello
`;
    const targetDate = new Date(2026, 5, 30);
    const now = new Date(2026, 5, 30, 8, 0, 0);
    const result = getDailyLogContentFromTemplate(template, null, targetDate, now);

    assert.ok(result.includes('📝 08:00:00'));
    assert.ok(result.includes('hello'));
    assert.doesNotMatch(result, /= backlog =/);
    assert.doesNotMatch(result, /Today is a new start/);
  });
});
