# ChronoArchive VS Code 擴充功能

**語言：** [English](README.md) · [简体中文](README.zh-CN.md) · **繁體中文** · [日本語](README.ja.md) · [한국어](README.ko.md) · [Tiếng Việt](README.vi.md) · [ไทย](README.th.md)

為 chronoarchive（`.car`）檔案提供語言支援——用於工作追蹤、帶時間戳記錄與提示容器的結構化純文字格式。

擴充功能介面（命令、設定、語意權杖標籤）透過 `package.nls.json` 與 `package.nls.<locale>.json` 本地化。VS Code 依目前顯示語言（`Configure Display Language`）載入對應字串。本儲存庫包含：`en`（預設，`package.nls.json`）、`zh-cn`、`zh-tw`、`ja`、`ko`、`vi`、`th`。

## 功能

- **語法醒目提示**：完整 TextMate 語法
- **語意權杖**：強化標記、日期時間、修飾符與屬性
- **摺疊區域**：可摺疊單一項目與超級標頭區塊
- **診斷**：缺少時間、空酬載、格式錯誤等
- **文件符號**：大綱視圖列出所有項目
- **CodeLens**：`/prompt` 項目的快速動作
- **鍵盤快速鍵**：標記循環、項目導覽與編輯
- **智慧移動項目**：移動時保留游標位置
- **自動最佳化**：管理項目之間的空白行

## 安裝

1. 複製本儲存庫  
2. 執行 `npm install`  
3. 按 F5 啟動擴充功能開發主機  
4. 開啟 `.car` 檔案

## 使用

建立 `.car` 檔案並開始撰寫結構化項目。

**每日日誌：** 按 **Ctrl+Alt+D**（或 **Alt+Meta+D**）建立並開啟今日日誌。路徑為 `<root>/年/年-月/年-月-日.car`。若檔案已存在則開啟，否則從範本建立。在**設定** → **ChronoArchive** 可設定 **Daily Logs Root**（留空為預設：Linux `~/Documents/Daily Logs` 或 `$XDG_DOCUMENTS_DIR/Daily Logs`；Windows `%USERPROFILE%\Documents\Daily Logs`）以及 **Daily Log Template Path**（`{{CREATION}}`、`{{TIME}}`；留空使用內建範本）。

## 鍵盤快速鍵

（快速鍵與英文版相同，見各表）

### 循環標記

| 快捷鍵 | 標記循環 | 說明 |
|----------|------------|-------------|
| `Ctrl+/` | ☑️ → ✅ → 🎉 → 關閉 | 完成類 |
| `Ctrl+'` | ❌ → ❎ → 🗑️ → 關閉 | 關閉類 |
| `Ctrl+Shift+/` | 🟡 → ⏱️ → ⌛ → 🚧 → 🔄 → 🛠️ → 關閉 | 待處理類 |
| `Ctrl+Shift+\` | 📝 → 📍 → 📌 → 關閉 | 重要性 |
| `Ctrl+Shift+'` | ⚠️ → ‼️ → 🔥 → 關閉 | 注意類 |
| `Ctrl+@` | ☕️ → 🍵 → 🍼 → 🍻 → 🍹 → 🍷 → 關閉 | 飲品 |
| `Ctrl+)` | 💕 → 🤏 → ☺️ → 😃 → 👍 → 😍 → 😘 → 關閉 | 正面情緒 |
| `Ctrl+(` | 🥺 → 🫩 → 😂 → 🤣 → 😭 → 😅 → 💀 → 關閉 | 負面情緒 |

### 每日日誌

| 快捷鍵 | 動作 |
|----------|--------|
| `Ctrl+Alt+D` | 建立並開啟今日日誌 |
| `Alt+PageUp` / `Alt+PageDown` | 跳到最近存在的相鄰日日誌（不建立檔案） |
| `Ctrl+Alt+PageUp` / `Ctrl+Alt+PageDown` | 上一日 / 下一日日曆日日誌；若無則從範本建立 |

### 單項切換

| 快捷鍵 | 動作 |
|----------|--------|
| `Ctrl+1` ~ `Ctrl+5` | 優先度 1–5 星 ⭐ |

### 項目導覽

| 快捷鍵 | 動作 |
|----------|--------|
| `Ctrl+K` | 上一項目 |
| `Ctrl+J` | 下一項目 |
| `Alt+K` | 上移項目 |
| `Alt+J` | 下移項目 |

### 新增項目

| 快捷鍵 | 動作 |
|----------|--------|
| `Alt+]` | 在目前之後插入 |
| `Alt+[` | 在目前項目之前插入 |
| `Alt+Shift+[` | 在目前行之前插入 |
| `Ctrl+Alt+=` | 在檔案結尾插入 |

### 刪除項目

| 快捷鍵 | 動作 |
|----------|--------|
| `Alt+Delete` | 刪除目前項目 |

### 設定

| 設定 | 預設值 | 說明 |
|---------|---------|-------------|
| `chronoarchive.blankLinesBetweenItems` | `0` | 項目間空白行數（0–3） |

## 快速開始

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

## 範例

### 超級標頭

```todo
Date: 2022-03-04
Author: Lenik
Project: ChronoArchive
```

### 項目結構

1. **標題列**（必填）：`[旗標] [日期] 時間 [修飾符]`
2. **屬性**（選填）：縮排的 `名稱: 值`
3. **酬載**（必填）：縮排內容

### 修飾符

- `/prompt` — 標記為提示
- `/php`、`/python`、`/json` 等 — 語言提示
- `/lang=identifier` — 明確指定語言

## 開發

```bash
npm run compile
```

```bash
npm run watch
```

```bash
npm test
```

## 授權

GPL
