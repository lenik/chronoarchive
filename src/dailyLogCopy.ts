import { parse } from './parser';
import { Item } from './types';

function formatCreation(date: Date): string {
  const wd = date.toLocaleDateString('en-US', { weekday: 'short' });
  const mon = date.toLocaleDateString('en-US', { month: 'short' });
  const day = date.getDate();
  const time = date.toLocaleTimeString('en-US', {
    hour12: true,
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  });
  const tzPart = date.toLocaleTimeString('en-US', { timeZoneName: 'short' });
  const tz = tzPart.split(' ').pop() || '';
  const year = date.getFullYear();
  return `${wd} ${mon} ${day} ${time} ${tz} ${year}`;
}

function formatTime(date: Date): string {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  const s = String(date.getSeconds()).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

function formatCalendarDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatSuperheader(sourceContent: string, now: Date): string {
  const { ast } = parse(sourceContent);
  if (ast.superheader.length === 0) {
    return `Title: Having_fun_with_ChronoArchive\nType: Daily Logs\nCreation: ${formatCreation(now)}\n`;
  }

  let hasCreation = false;
  const lines = ast.superheader.map((attr) => {
    if (attr.name === 'Creation') {
      hasCreation = true;
      return `Creation: ${formatCreation(now)}`;
    }
    return `${attr.name}: ${attr.value}`;
  });
  if (!hasCreation) {
    lines.push(`Creation: ${formatCreation(now)}`);
  }
  return lines.join('\n') + '\n';
}

function indentPayload(payload: string): string {
  if (!payload.trim()) {
    return '';
  }
  return payload
    .split('\n')
    .map((line) => (line.length === 0 ? '' : `    ${line.trimStart()}`))
    .join('\n');
}

function collectPayloadLines(items: Item[]): string[] {
  const parts: string[] = [];
  for (const item of items) {
    const body = indentPayload(item.payload);
    if (body.trim()) {
      parts.push(body);
    }
  }
  return parts;
}

function formatBacklogHead(sourceDate: Date, items: Item[]): string {
  const dateStr = formatCalendarDate(sourceDate);
  const firstTime = items[0].time;
  const lastTime = items[items.length - 1].time;
  return `${dateStr} ${firstTime} .. ${lastTime}`;
}

const NEW_DAY_MESSAGE = 'Today is a new start! ^_^';

/**
 * Build a new daily log by copying the previous day's file:
 * update Creation, prepend today's starter item, and roll prior items into one backlog block.
 */
export function buildCopiedDailyLogContent(
  sourceContent: string,
  sourceDate: Date,
  now: Date
): string {
  const { ast } = parse(sourceContent);
  const header = formatSuperheader(sourceContent, now);
  const time = formatTime(now);

  if (ast.items.length === 0) {
    return `${header}\n📝 ${time}\n    ${NEW_DAY_MESSAGE}\n`;
  }

  const backlogPayloadParts = collectPayloadLines(ast.items);
  const backlogBody = ['    = backlog =', '', backlogPayloadParts.join('\n\n')].join('\n');
  const backlogHead = formatBacklogHead(sourceDate, ast.items);

  return `${header}\n📝 ${time}\n    ${NEW_DAY_MESSAGE}\n\n${backlogHead}\n${backlogBody}\n`;
}
