import * as assert from 'assert';
import { buildCopiedDailyLogContent } from '../../dailyLogCopy';

suite('Daily Log Copy Tests', () => {
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
});
