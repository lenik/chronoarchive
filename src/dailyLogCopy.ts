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

/**
 * Parse the calendar date from a Creation superheader value (time and timezone are ignored).
 * Expects the format produced by {@link formatCreation}, e.g. `Wed Mar 14 12:54:33 PM CST 2026`.
 */
export function parseCreationCalendarDate(creationValue: string): Date | null {
  const trimmed = creationValue.trim();
  const head = /^(\w{3})\s+(\w{3})\s+(\d{1,2})\b/.exec(trimmed);
  if (!head) {
    return null;
  }
  const yearMatch = /\b(\d{4})\s*$/.exec(trimmed);
  if (!yearMatch) {
    return null;
  }
  const year = parseInt(yearMatch[1], 10);
  const parsed = new Date(`${head[2]} ${head[3]}, ${year}`);
  if (isNaN(parsed.getTime())) {
    return null;
  }
  const date = new Date(year, parsed.getMonth(), parsed.getDate());
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== parsed.getMonth() ||
    date.getDate() !== parsed.getDate()
  ) {
    return null;
  }
  return date;
}

/** Read `Creation:` from file content and return its calendar date, or null if missing/invalid. */
export function parseCreationCalendarDateFromContent(content: string): Date | null {
  const { ast } = parse(content);
  const creation = ast.superheader.find((attr) => attr.name.toLowerCase() === 'creation');
  if (!creation) {
    return null;
  }
  return parseCreationCalendarDate(creation.value);
}

export function formatCalendarDateLabel(date: Date): string {
  return formatCalendarDate(date);
}

export function isSameCalendarDate(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatSuperheader(sourceContent: string, now: Date): string {
  const { ast } = parse(sourceContent);
  if (ast.superheader.length === 0) {
    return `Title: Having_fun_with_ChronoArchive\nType: Daily Logs\nCreation: ${formatCreation(now)}\n`;
  }

  let hasCreation = false;
  const lines = ast.superheader.map((attr) => {
    if (attr.name.toLowerCase() === 'creation') {
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

/** Parse `YYYY-MM-DD` from a `.car` basename or full path. */
export function parseDateFromDailyLogBasename(filePath: string): Date | null {
  const base = filePath.replace(/^.*[/\\]/, '').replace(/\.car$/i, '');
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(base);
  if (!match) {
    return null;
  }
  const y = parseInt(match[1], 10);
  const m = parseInt(match[2], 10) - 1;
  const d = parseInt(match[3], 10);
  const date = new Date(y, m, d);
  if (date.getFullYear() !== y || date.getMonth() !== m || date.getDate() !== d) {
    return null;
  }
  return date;
}

function getPreviousCalendarDate(date: Date): Date {
  const prev = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  prev.setDate(prev.getDate() - 1);
  return prev;
}

/**
 * Apply {{CREATION}}/{{TIME}} placeholders and refresh any existing Creation: line
 * (custom templates often ship a static timestamp with no placeholders).
 */
export function applyDailyLogTemplate(template: string, date: Date): string {
  const creation = formatCreation(date);
  const time = formatTime(date);
  return template
    .replace(/\{\{CREATION\}\}/g, creation)
    .replace(/\{\{TIME\}\}/g, time)
    .replace(/^Creation:\s*.+$/m, `Creation: ${creation}`);
}

/**
 * Build today's log from the previous session document:
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

/**
 * Turn template / prior-session source text into new daily log file content.
 * `sourcePath` set (custom template or prior `.car`): Creation refresh + backlog.
 * `sourcePath` null (built-in starter): placeholders only.
 */
export function getDailyLogContentFromTemplate(
  templateContent: string,
  sourcePath: string | null,
  targetDate: Date,
  now: Date = new Date()
): string {
  if (sourcePath !== null) {
    const sourceDate =
      parseDateFromDailyLogBasename(sourcePath) ?? getPreviousCalendarDate(targetDate);
    return buildCopiedDailyLogContent(templateContent, sourceDate, now);
  }
  return applyDailyLogTemplate(templateContent, now);
}
