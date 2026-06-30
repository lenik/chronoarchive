import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { buildCopiedDailyLogContent } from './dailyLogCopy';

const DAILY_LOGS_FOLDER = 'Daily Logs';

function getDefaultDailyLogsRoot(): string {
  const platform = process.platform;
  if (platform === 'win32') {
    const base = process.env.USERPROFILE || os.homedir();
    return path.join(base, 'Documents', DAILY_LOGS_FOLDER);
  }
  // Linux and macOS: XDG_DOCUMENTS_DIR or ~/Documents
  const base = process.env.XDG_DOCUMENTS_DIR || path.join(os.homedir(), 'Documents');
  return path.join(base, DAILY_LOGS_FOLDER);
}

function expandPath(p: string): string {
  if (p.startsWith('~/') || p === '~') {
    return path.join(os.homedir(), p.slice(1));
  }
  if (p.startsWith('~' + path.sep) || (path.sep !== '/' && p.startsWith('~\\'))) {
    return path.join(os.homedir(), p.slice(2));
  }
  return p;
}

export function getDailyLogsRoot(): string {
  const config = vscode.workspace.getConfiguration('chronoarchive');
  const configured = config.get<string>('dailyLogsRoot', '');
  if (configured && configured.trim() !== '') {
    const root = expandPath(configured.trim());
    return path.isAbsolute(root) ? root : path.join(os.homedir(), root);
  }
  return getDefaultDailyLogsRoot();
}

export function getDailyLogPathForDate(root: string, date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const filename = `${year}-${month}-${day}.car`;
  return path.join(root, String(year), `${year}-${month}`, filename);
}

/**
 * If `filePath` is a daily log file under the configured root (`.../YEAR/YEAR-MM/YYYY-MM-DD.car`), return that calendar date; otherwise null.
 */
export function tryParseDailyLogDateFromFilePath(filePath: string): Date | null {
  const root = path.resolve(getDailyLogsRoot());
  const resolved = path.resolve(filePath);
  const rootNorm = root.endsWith(path.sep) ? root.slice(0, -1) : root;
  const resNorm = resolved.endsWith(path.sep) ? resolved.slice(0, -1) : resolved;
  const isWin = process.platform === 'win32';
  const under = isWin
    ? resNorm.toLowerCase().startsWith(rootNorm.toLowerCase() + path.sep)
    : resNorm.startsWith(rootNorm + path.sep);
  if (!under) {
    return null;
  }
  const base = path.basename(filePath, '.car');
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

const TEMPLATE = `Title: Having_fun_with_ChronoArchive
Type: Daily Logs
Creation: {{CREATION}}

📝 09:00:00
    开始✨一天快乐🧡的工作🚀

⏱️ 10:30:00
    记得😋吃点心，特别是猕猴桃🥝 饼🍪干

⌛ 12:00:00
    要学会使用快捷键哦
        Ctrl+1..5 星标⭐⭐⭐
        Ctrl+/ 完成✅    Ctrl+Alt+=     追加
        Ctrl+' 关闭❌    Alt+[/]        向前/后插入
        Ctrl+" 注意⚠️    Alt+Shift+[    拆分插入
        Ctrl+| 图钉📌    Alt+Del        删除
        Ctrl+? 等等⌛    Ctrl+J/K       向前/向后跳
        Ctrl+@ 饮品🍼    Alt+J/K        向前/向后移动
        Ctrl+Alt+D 今天  Alt+PgUp/PgDn  前/后一天

☕️ 13:18:00
    据说为作者👧买杯咖啡☕️很快就能获得📈巨大的成功💎呢～
`;

function getTemplateContent(): string {
  const config = vscode.workspace.getConfiguration('chronoarchive');
  const templatePath = config.get<string>('dailyLogTemplatePath', '');
  if (templatePath && templatePath.trim() !== '') {
    const resolved = expandPath(templatePath.trim());
    const absPath = path.isAbsolute(resolved) ? resolved : path.join(os.homedir(), resolved);
    if (fs.existsSync(absPath)) {
      try {
        return fs.readFileSync(absPath, 'utf8');
      } catch {
        // fall through to default
      }
    }
  }
  return TEMPLATE;
}

export function getDailyLogContent(date: Date): string {
  const creation = formatCreation(date);
  const time = formatTime(date);
  const template = getTemplateContent();
  return template.replace(/\{\{CREATION\}\}/g, creation).replace(/\{\{TIME\}\}/g, time);
}

function getPreviousCalendarDate(date: Date): Date {
  const prev = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  prev.setDate(prev.getDate() - 1);
  return prev;
}

/**
 * Content for a new daily log: copy from the previous day's file when it exists, otherwise use the template.
 */
function getContentForNewDailyLog(targetDate: Date, root: string): string {
  const now = new Date();
  const prevDate = getPreviousCalendarDate(targetDate);
  const prevPath = getDailyLogPathForDate(root, prevDate);
  if (fs.existsSync(prevPath)) {
    try {
      const source = fs.readFileSync(prevPath, 'utf8');
      return buildCopiedDailyLogContent(source, prevDate, now);
    } catch {
      // fall through to template
    }
  }
  return getDailyLogContent(now);
}

/** Max calendar days to scan when jumping to an existing adjacent daily log (safety cap). */
const MAX_ADJACENT_SCAN_DAYS = 365 * 50;

function pathsEqualFs(a: string, b: string): boolean {
  const na = path.normalize(a);
  const nb = path.normalize(b);
  if (process.platform === 'win32') {
    return na.toLowerCase() === nb.toLowerCase();
  }
  return na === nb;
}

/**
 * Show a daily log URI. If the active editor is an unmodified daily log under the configured root, close it first so the target opens in the same slot instead of a new tab.
 */
async function showDailyLogInEditor(uri: vscode.Uri): Promise<void> {
  const active = vscode.window.activeTextEditor;
  if (
    active?.document.uri.scheme === 'file' &&
    pathsEqualFs(active.document.uri.fsPath, uri.fsPath)
  ) {
    await vscode.window.showTextDocument(active.document, { preview: false });
    return;
  }

  const reuseSlot =
    active &&
    !active.document.isDirty &&
    active.document.uri.scheme === 'file' &&
    tryParseDailyLogDateFromFilePath(active.document.uri.fsPath) !== null;

  let viewColumn: vscode.ViewColumn | undefined;
  if (reuseSlot) {
    viewColumn = active.viewColumn;
    await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
  }

  const doc = await vscode.workspace.openTextDocument(uri);
  await vscode.window.showTextDocument(doc, {
    preview: false,
    viewColumn: viewColumn ?? vscode.ViewColumn.Active,
  });
}

export async function openDailyLogForDate(
  date: Date,
  options?: { createIfMissing?: boolean }
): Promise<void> {
  const createIfMissing = options?.createIfMissing !== false;
  const root = getDailyLogsRoot();
  const filePath = getDailyLogPathForDate(root, date);

  try {
    if (!fs.existsSync(filePath)) {
      if (!createIfMissing) {
        return;
      }
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const content = getContentForNewDailyLog(date, root);
      fs.writeFileSync(filePath, content, 'utf8');
    }

    const uri = vscode.Uri.file(filePath);
    await showDailyLogInEditor(uri);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    vscode.window.showErrorMessage(`ChronoArchive: Failed to open daily log: ${message}`);
  }
}

export async function openDailyLog(): Promise<void> {
  await openDailyLogForDate(new Date());
}

/**
 * Open the nearest existing daily log in the given direction (previous / next calendar days), relative to the active editor's daily log date or today.
 * Skips dates with no file. If none is found within {@link MAX_ADJACENT_SCAN_DAYS} steps, does nothing (no UI).
 */
export async function openAdjacentDailyLog(offsetDays: number): Promise<void> {
  let base = new Date();
  const editor = vscode.window.activeTextEditor;
  if (editor?.document.uri.scheme === 'file') {
    const parsed = tryParseDailyLogDateFromFilePath(editor.document.uri.fsPath);
    if (parsed) {
      base = parsed;
    }
  }
  const root = getDailyLogsRoot();
  const step = offsetDays > 0 ? 1 : -1;
  const candidate = new Date(base.getFullYear(), base.getMonth(), base.getDate());
  candidate.setDate(candidate.getDate() + step);

  for (let i = 0; i < MAX_ADJACENT_SCAN_DAYS; i++) {
    const filePath = getDailyLogPathForDate(root, candidate);
    if (fs.existsSync(filePath)) {
      await openDailyLogForDate(candidate, { createIfMissing: false });
      return;
    }
    candidate.setDate(candidate.getDate() + step);
  }
}

/**
 * Open the daily log for exactly one calendar day before or after the base date (active daily log file or today), creating the file from the template if missing.
 */
export async function openAdjacentDailyLogCreate(offsetDays: number): Promise<void> {
  let base = new Date();
  const editor = vscode.window.activeTextEditor;
  if (editor?.document.uri.scheme === 'file') {
    const parsed = tryParseDailyLogDateFromFilePath(editor.document.uri.fsPath);
    if (parsed) {
      base = parsed;
    }
  }
  const step = offsetDays > 0 ? 1 : -1;
  const target = new Date(base.getFullYear(), base.getMonth(), base.getDate());
  target.setDate(target.getDate() + step);
  await openDailyLogForDate(target, { createIfMissing: true });
}
