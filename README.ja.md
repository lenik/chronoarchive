# ChronoArchive VS Code 拡張機能

**言語：** [English](README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · **日本語** · [한국어](README.ko.md) · [Tiếng Việt](README.vi.md) · [ไทย](README.th.md)

chronoarchive（`.car`）ファイル向けの言語サポートです。タスク追跡、タイムスタンプ付きログ、プロンプト用コンテナのための構造化プレーンテキスト形式を扱います。

コマンド名、設定、セマンティックトークンの説明は `package.nls.json` と `package.nls.<locale>.json` でローカライズされます。VS Code の表示言語（`Configure Display Language`）に従います。同梱ロケール: `en`（既定、`package.nls.json`）、`zh-cn`、`zh-tw`、`ja`、`ko`、`vi`、`th`。

## 機能

- **シンタックスハイライト**：TextMate 文法
- **セマンティックトークン**：フラグ、日時、修飾子、属性の強調
- **フォールディング**：項目単位・スーパーヘッダーブロック
- **診断**：時刻欠落、空ペイロード、不正な項目など
- **ドキュメントシンボル**：アウトラインに全項目を表示
- **CodeLens**：`/prompt` 項目のクイックアクション
- **キーボードショートカット**：フラグ循環、ナビゲーション、編集
- **スマート移動**：項目移動時にカーソル位置を維持
- **自動最適化**：項目間の空行を管理

## インストール

1. リポジトリをクローン  
2. `npm install`  
3. F5 で拡張機能開発ホストを起動  
4. `.car` ファイルを開く

## 使い方

`.car` ファイルを作成し、構造化された項目を記述します。

**デイリーログ：** **Ctrl+Alt+D**（または **Alt+Meta+D**）で今日のログを作成・開きます。パスは `<root>/年/年-月/年-月-日.car` です。既存なら開き、なければテンプレートから作成。**設定** → **ChronoArchive** で **Daily Logs Root**（空欄で既定：Linux は `~/Documents/Daily Logs` または `$XDG_DOCUMENTS_DIR/Daily Logs`、Windows は `%USERPROFILE%\Documents\Daily Logs`）と **Daily Log Template Path**（`{{CREATION}}`、`{{TIME}}`、空欄で内蔵テンプレート）を指定できます。

## キーボードショートカット

（キーは英語版と同じです）

### フラグの循環

| ショートカット | フラグの循環 | 説明 |
|----------|------------|-------------|
| `Ctrl+/` | ☑️ → ✅ → 🎉 → off | 完了系 |
| `Ctrl+'` | ❌ → ❎ → 🗑️ → off | クローズ系 |
| `Ctrl+Shift+/` | 🟡 → ⏱️ → ⌛ → 🚧 → 🔄 → 🛠️ → off | 保留系 |
| `Ctrl+Shift+\` | 📝 → 📍 → 📌 → off | 重要度 |
| `Ctrl+Shift+'` | ⚠️ → ‼️ → 🔥 → off | 注意 |
| `Ctrl+@` | ☕️ → 🍵 → 🍼 → 🍻 → 🍹 → 🍷 → off | 飲み物 |
| `Ctrl+)` | 💕 → 🤏 → ☺️ → 😃 → 👍 → 😍 → 😘 → off | ポジティブ感情 |
| `Ctrl+(` | 🥺 → 🫩 → 😂 → 🤣 → 😭 → 😅 → 💀 → off | ネガティブ感情 |

### デイリーログ

| ショートカット | 操作 |
|----------|--------|
| `Ctrl+Alt+D` | 今日のデイリーログを作成・開く |
| `Alt+PageUp` / `Alt+PageDown` | 近い既存の日付のログへ（ファイルは作成しない） |
| `Ctrl+Alt+PageUp` / `Ctrl+Alt+PageDown` | 前日 / 翌日のカレンダー日のログ（無ければテンプレートから作成） |

### 優先度

| ショートカット | 操作 |
|----------|--------|
| `Ctrl+1` ~ `Ctrl+5` | 優先度 1〜5 星 ⭐ |

### 項目の移動

| ショートカット | 操作 |
|----------|--------|
| `Ctrl+K` | 前の項目へ |
| `Ctrl+J` | 次の項目へ |
| `Alt+K` | 項目を上へ |
| `Alt+J` | 項目を下へ |

### 項目の追加

| ショートカット | 操作 |
|----------|--------|
| `Alt+]` | 現在の後に追加 |
| `Alt+[` | 現在の項目の前に追加 |
| `Alt+Shift+[` | 現在の行の前に追加 |
| `Ctrl+Alt+=` | ファイル末尾に追加 |

### 削除

| ショートカット | 操作 |
|----------|--------|
| `Alt+Delete` | 現在の項目を削除 |

### 設定

| 設定 | 既定値 | 説明 |
|---------|---------|-------------|
| `chronoarchive.blankLinesBetweenItems` | `0` | 項目間の空行数（0〜3） |

## クイックスタート

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

## 例

### スーパーヘッダー

```todo
Date: 2022-03-04
Author: Lenik
Project: ChronoArchive
```

### 項目の構造

1. **見出し行**（必須）：`[フラグ] [日付] 時刻 [修飾子]`
2. **属性**（任意）：インデントした `名前: 値`
3. **ペイロード**（必須）：インデントした本文

### 修飾子

- `/prompt` — プロンプトとしてマーク
- `/php`、`/python`、`/json` など — 言語ヒント
- `/lang=identifier` — 明示的な言語指定

## 開発

```bash
npm run compile
```

```bash
npm run watch
```

```bash
npm test
```

## ライセンス

GPL
</think>


<｜tool▁calls▁begin｜><｜tool▁call▁begin｜>
StrReplace