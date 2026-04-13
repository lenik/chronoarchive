# Phần mở rộng ChronoArchive cho VS Code

**Ngôn ngữ:** [English](README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · **Tiếng Việt** · [ไทย](README.th.md)

Hỗ trợ ngôn ngữ cho tệp chronoarchive (`.car`) — định dạng văn bản thuần có cấu trúc để theo dõi công việc, ghi nhật ký có dấu thời gian và chứa prompt.

Giao diện mở rộng (lệnh, cài đặt, mô tả token ngữ nghĩa) được bản địa hóa qua `package.nls.json` và `package.nls.<locale>.json`. VS Code dùng ngôn ngữ hiển thị (`Configure Display Language`). Các locale trong kho: `en` (mặc định, `package.nls.json`), `zh-cn`, `zh-tw`, `ja`, `ko`, `vi`, `th`.

## Tính năng

- **Tô sáng cú pháp**: Ngữ pháp TextMate đầy đủ
- **Token ngữ nghĩa**: Làm nổi cờ, ngày giờ, bộ chỉnh và thuộc tính
- **Gấp mã**: Gấp từng mục và khối siêu tiêu đề
- **Chẩn đoán**: Kiểm tra thiếu thời gian, payload rỗng, mục sai định dạng
- **Ký hiệu tài liệu**: Dạng xem dàn bài liệt kê mọi mục
- **CodeLens**: Thao tác nhanh cho mục `/prompt`
- **Phím tắt**: Vòng cờ, điều hướng và thao tác mục
- **Di chuyển thông minh**: Giữ vị trí con trỏ khi di chuyển mục
- **Tối ưu tự động**: Quản lý dòng trống giữa các mục

## Cài đặt

1. Clone kho  
2. Chạy `npm install`  
3. Nhấn F5 để mở Extension Development Host  
4. Mở tệp `.car`

## Sử dụng

Tạo tệp `.car` và viết các mục có cấu trúc.

**Nhật ký hàng ngày:** Nhấn **Ctrl+Alt+D** (hoặc **Alt+Meta+D**) để tạo và mở nhật ký hôm nay. Đường dẫn: `<root>/NĂM/NĂM-THÁNG/NĂM-THÁNG-NGÀY.car`. Nếu tệp đã có thì mở; nếu không thì tạo từ mẫu. Trong **Cài đặt** → **ChronoArchive** có **Daily Logs Root** (để trống = mặc định: Linux `~/Documents/Daily Logs` hoặc `$XDG_DOCUMENTS_DIR/Daily Logs`; Windows `%USERPROFILE%\Documents\Daily Logs`) và **Daily Log Template Path** (placeholder `{{CREATION}}`, `{{TIME}}`; để trống dùng mẫu có sẵn).

## Phím tắt

(Tổ hợp phím giống bản tiếng Anh)

### Vòng cờ

| Phím tắt | Chu kỳ cờ | Mô tả |
|----------|------------|-------------|
| `Ctrl+/` | ☑️ → ✅ → 🎉 → tắt | Hoàn thành |
| `Ctrl+'` | ❌ → ❎ → 🗑️ → tắt | Đóng |
| `Ctrl+Shift+/` | 🟡 → ⏱️ → ⌛ → 🚧 → 🔄 → 🛠️ → tắt | Chờ xử lý |
| `Ctrl+Shift+\` | 📝 → 📍 → 📌 → tắt | Mức quan trọng |
| `Ctrl+Shift+'` | ⚠️ → ‼️ → 🔥 → tắt | Chú ý |
| `Ctrl+@` | ☕️ → 🍵 → 🍼 → 🍻 → 🍹 → 🍷 → tắt | Đồ uống |
| `Ctrl+)` | 💕 → 🤏 → ☺️ → 😃 → 👍 → 😍 → 😘 → tắt | Cảm xúc tích cực |
| `Ctrl+(` | 🥺 → 🫩 → 😂 → 🤣 → 😭 → 😅 → 💀 → tắt | Cảm xúc tiêu cực |

### Nhật ký hàng ngày

| Phím tắt | Hành động |
|----------|--------|
| `Ctrl+Alt+D` | Tạo và mở nhật ký hôm nay |
| `Alt+PageUp` / `Alt+PageDown` | Nhảy tới nhật ký ngày gần nhất đã tồn tại (không tạo tệp) |
| `Ctrl+Alt+PageUp` / `Ctrl+Alt+PageDown` | Mở nhật ký ngày trước / sau theo lịch (tạo từ mẫu nếu thiếu) |

### Ưu tiên

| Phím tắt | Hành động |
|----------|--------|
| `Ctrl+1` ~ `Ctrl+5` | Đặt ưu tiên 1–5 sao ⭐ |

### Điều hướng mục

| Phím tắt | Hành động |
|----------|--------|
| `Ctrl+K` | Mục trước |
| `Ctrl+J` | Mục sau |
| `Alt+K` | Di chuyển mục lên |
| `Alt+J` | Di chuyển mục xuống |

### Thêm mục

| Phím tắt | Hành động |
|----------|--------|
| `Alt+]` | Thêm sau vị trí hiện tại |
| `Alt+[` | Thêm trước mục hiện tại |
| `Alt+Shift+[` | Thêm trước dòng hiện tại |
| `Ctrl+Alt+=` | Thêm ở cuối tệp |

### Xóa

| Phím tắt | Hành động |
|----------|--------|
| `Alt+Delete` | Xóa mục hiện tại |

### Cấu hình

| Cài đặt | Mặc định | Mô tả |
|---------|---------|-------------|
| `chronoarchive.blankLinesBetweenItems` | `0` | Số dòng trống giữa các mục (0–3) |

## Bắt đầu nhanh

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

## Ví dụ

### Siêu tiêu đề

```todo
Date: 2022-03-04
Author: Lenik
Project: ChronoArchive
```

### Cấu trúc mục

1. **Dòng đầu** (bắt buộc): `[cờ] [ngày] giờ [bộ chỉnh]`
2. **Thuộc tính** (tùy chọn): Cặp `Tên: Giá trị` thụt lề
3. **Payload** (bắt buộc): Khối nội dung thụt lề

### Bộ chỉnh

- `/prompt` — Đánh dấu là prompt
- `/php`, `/python`, `/json`, v.v. — Gợi ý ngôn ngữ
- `/lang=identifier` — Chỉ định ngôn ngữ rõ ràng

## Phát triển

```bash
npm run compile
```

```bash
npm run watch
```

```bash
npm test
```

## Giấy phép

GPL
