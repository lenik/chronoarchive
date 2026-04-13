# ChronoArchive VS Code 扩展

**语言：** [English](README.md) · **简体中文** · [繁體中文](README.zh-TW.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Tiếng Việt](README.vi.md) · [ไทย](README.th.md)

为 chronoarchive（`.car`）文件提供语言支持——一种面向任务跟踪、带时间戳的记录与提示容器的结构化纯文本格式。

扩展界面（命令、设置、语义高亮说明）通过 `package.nls.json` 与 `package.nls.<locale>.json` 本地化。VS Code 根据当前显示语言（`Configure Display Language`）加载对应文案。本仓库包含：`en`（默认，`package.nls.json`）、`zh-cn`、`zh-tw`、`ja`、`ko`、`vi`、`th`。

## 功能

- **语法高亮**：完整的 TextMate 语法支持
- **语义标记**：为标记、日期时间、修饰符与属性增强高亮
- **折叠区域**：可折叠单条条目与超级标头块
- **诊断**：检查缺少时间、空载荷、格式错误等
- **文档符号**：大纲视图列出文件中所有条目
- **CodeLens**：`/prompt` 条目的快捷操作
- **键盘快捷键**：标记循环、条目导航与编辑等
- **智能移动条目**：移动时保持光标位置
- **自动优化**：自动管理条目之间的空行

## 安装

1. 克隆本仓库  
2. 运行 `npm install`  
3. 按 F5 启动扩展开发宿主  
4. 打开 `.car` 文件即可体验

## 使用

创建 `.car` 文件并开始编写结构化条目。

**每日日志：** 按 **Ctrl+Alt+D**（或 **Alt+Meta+D**）创建并打开今日日志。日志为根目录下的 `.car` 文件：`<root>/年/年-月/年-月-日.car`（例如 `.../2026/2026-03/2026-03-14.car`）。若文件已存在则打开，否则从模板新建。在**设置** → **ChronoArchive** 中可配置 **Daily Logs Root**（留空为默认：Linux 为 `~/Documents/Daily Logs` 或 `$XDG_DOCUMENTS_DIR/Daily Logs`；Windows 为 `%USERPROFILE%\Documents\Daily Logs`）以及 **Daily Log Template Path**（自定义模板路径；占位符 `{{CREATION}}` 与 `{{TIME}}`；留空使用内置模板）。

## 键盘快捷键

（快捷键与英文版一致，见各表）

### 循环标记

重复按键可在各标记间循环；最后一档后再按则关闭。

| 快捷键 | 标记循环 | 说明 |
|----------|------------|-------------|
| `Ctrl+/` | ☑️ → ✅ → 🎉 → 关闭 | 完成类 |
| `Ctrl+'` | ❌ → ❎ → 🗑️ → 关闭 | 关闭类 |
| `Ctrl+Shift+/` | 🟡 → ⏱️ → ⌛ → 🚧 → 🔄 → 🛠️ → 关闭 | 待处理类 |
| `Ctrl+Shift+\` | 📝 → 📍 → 📌 → 关闭 | 重要性 |
| `Ctrl+Shift+'` | ⚠️ → ‼️ → 🔥 → 关闭 | 注意类 |
| `Ctrl+@` | ☕️ → 🍵 → 🍼 → 🍻 → 🍹 → 🍷 → 关闭 | 饮品 |
| `Ctrl+)` | 💕 → 🤏 → ☺️ → 😃 → 👍 → 😍 → 😘 → 关闭 | 正面情绪 |
| `Ctrl+(` | 🥺 → 🫩 → 😂 → 🤣 → 😭 → 😅 → 💀 → 关闭 | 负面情绪 |

### 每日日志

| 快捷键 | 操作 |
|----------|--------|
| `Ctrl+Alt+D` | 创建并打开今日日志（路径见上） |
| `Alt+PageUp` / `Alt+PageDown` | 跳到最近存在的**相邻**日日志（跳过空日期；不创建文件） |
| `Ctrl+Alt+PageUp` / `Ctrl+Alt+PageDown` | 打开**上一日 / 下一日**日历日日志；若缺失则**从模板创建** |

### 单项切换

| 快捷键 | 操作 |
|----------|--------|
| `Ctrl+1` ~ `Ctrl+5` | 设置优先级 1–5 星 ⭐ |

### 条目导航

| 快捷键 | 操作 |
|----------|--------|
| `Ctrl+K` | 上一条目（光标在正文） |
| `Ctrl+J` | 下一条目 |
| `Alt+K` | 上移条目 |
| `Alt+J` | 下移条目 |

### 新建条目

| 快捷键 | 操作 |
|----------|--------|
| `Alt+]` | 在当前之后插入 |
| `Alt+[` | 在当前**条目**之前插入（标题行之前） |
| `Alt+Shift+[` | 在当前**行**之前插入（标题行上同 `Alt+[`；在属性/正文行时按「条目间空行」规则插入） |
| `Ctrl+Alt+=` | 在文件末尾插入 |

### 删除条目

| 快捷键 | 操作 |
|----------|--------|
| `Alt+Delete` | 删除当前条目 |

### 配置

| 设置 | 默认值 | 说明 |
|---------|---------|-------------|
| `chronoarchive.blankLinesBetweenItems` | `0` | 条目间空行数（0–3） |

## 快速开始

```todo
Date: 2022-03-04
Author: Lenik

📝 12:34:56
    This is a note item

✅ 12:45:00 /prompt
    Write a program about weather analysis.

    1. Qt based
    2. Access local proxy

✅ 12:56:12 /php
    <?php
        phpinfo();
    ?>
```

## 示例

### 超级标头

文件顶部可选元数据：

```todo
Date: 2022-03-04
Author: Lenik
Project: ChronoArchive
```

### 条目结构

每条目包含：

1. **标题行**（必填）：`[标记] [日期] 时间 [修饰符]`
2. **属性**（可选）：缩进的 `名称: 值`
3. **正文**（必填）：缩进内容块

### 标题行组成

- **标记**（可选）：表情或文本（📝、✅、TODO 等）
- **日期**（可选）：`YYYY-MM-DD` 或 `YYYY/MM/DD`
- **时间**（必填）：`HH:MM` 或 `HH:MM:SS`
- **修饰符**（可选）：`/prompt`、`/php`、`/lang=python` 等

### 修饰符

- `/prompt` — 标记为提示条目
- `/php`、`/python`、`/json` 等 — 语言提示
- `/lang=identifier` — 显式指定语言

## 开发

### 构建

```bash
npm run compile
```

### 监视模式

```bash
npm run watch
```

### 测试

```bash
npm test
```

## 许可

GPL
