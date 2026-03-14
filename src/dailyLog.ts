import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

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
        Ctrl+' 关闭❌    Ctrl+Shift+P   向前插入
        Ctrl+" 注意⚠️    Ctrl+P         向后插入
        Ctrl+| 图钉📌    Ctrl+Shift+Del 删除
        Ctrl+? 等等⌛    Ctrl+J/K       向前/向后跳
        Ctrl+@ 饮品🍼    Alt+J/K        向前/向后移动

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

export async function openDailyLog(): Promise<void> {
  const root = getDailyLogsRoot();
  const date = new Date();
  const filePath = getDailyLogPathForDate(root, date);

  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (!fs.existsSync(filePath)) {
      const content = getDailyLogContent(date);
      fs.writeFileSync(filePath, content, 'utf8');
    }

    const uri = vscode.Uri.file(filePath);
    const doc = await vscode.workspace.openTextDocument(uri);
    await vscode.window.showTextDocument(doc, { preview: false });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    vscode.window.showErrorMessage(`ChronoArchive: Failed to open daily log: ${message}`);
  }
}
