# App Quản lí Chi tiêu — Thiết kế

Ngày: 2026-07-04

## Mục tiêu
App web dùng trên điện thoại (PWA) giúp quản lí chi tiêu cá nhân: ví, thu/chi,
danh mục, chuyển tiền, lịch sử, thống kê biểu đồ, và một chế độ "quét giỏ hàng"
riêng để kiểm soát tiền khi đi siêu thị.

## Kiến trúc
- **Client-only PWA**, chạy hoàn toàn trong trình duyệt, offline, không đăng nhập.
- Dữ liệu lưu trên máy bằng **IndexedDB** (qua thư viện `idb`).
- Export/Import file JSON để backup và chuyển máy.
- Stack: **React + Vite + TypeScript + Tailwind CSS + Recharts**.
- Quét: **Tesseract.js** (OCR số tiền, chạy offline) + **@zxing/browser** (QR/mã vạch).

## Mô hình dữ liệu
- **Wallet**: `id, name, icon, color, initialBalance, createdAt`. Số dư = initialBalance
  + tổng thu − tổng chi − chuyển đi + chuyển đến.
- **Category**: `id, name, icon, color, type ('income' | 'expense')`.
- **Transaction**: `id, type ('income'|'expense'), name, amount, date, walletId,
  categoryId, note, createdAt`.
- **Transfer**: `id, fromWalletId, toWalletId, amount, date, note, createdAt`.
- Tiền tệ: **VND (₫)**, không phần thập phân, có phân tách hàng nghìn.

## Màn hình
1. **Home**: tổng số dư mọi ví; danh sách thẻ ví; biểu đồ chi tiêu (line); giao dịch gần đây; nút + nổi.
2. **Wallets**: CRUD ví; chuyển tiền giữa các ví.
3. **Add Transaction**: tên, số tiền, ngày, ví, danh mục, loại Thu/Chi.
4. **Categories**: CRUD danh mục thu & chi (icon + màu).
5. **History**: danh sách giao dịch (gồm cả transfer); lọc theo All/Hôm nay/Tuần/Tháng/Năm, theo ví, danh mục.
6. **Reports**: biểu đồ **line** theo **tuần / tháng / năm**, tách thu vs chi; tổng hợp theo danh mục.
7. **Scan (giỏ hàng)** — tính năng riêng: chụp/tải ảnh giá → OCR đọc số → xác nhận/sửa →
   cộng dồn danh sách với **tổng đang chạy**; đặt **hạn mức** cảnh báo khi vượt; quét QR/mã vạch
   thêm tên món. Nút **"Thêm vào chi tiêu hôm nay"** mới ghi tổng thành 1 giao dịch chi;
   nếu không thì chỉ là bảng tính tạm.

## Style
Tông sáng nhẹ nhàng, gradient tím–hồng pastel, bo góc lớn, thẻ nổi (soft shadow),
bottom navigation. Tham khảo mockup người dùng gửi.

## Điều hướng
Bottom nav 5 mục: Home · History · **+ (Add)** · Reports · Wallets.
Scan và Categories truy cập từ Home/Wallets (nút phụ). Có thể để Scan là nút nổi phụ ở Home.

## Xử lý lỗi / trạng thái
- OCR có thể sai → luôn cho sửa số trước khi cộng.
- Camera bị từ chối quyền → cho phép tải ảnh từ thư viện thay thế.
- Ví có giao dịch khi xoá → cảnh báo trước.
- Trạng thái rỗng (chưa có ví/giao dịch) → màn hình hướng dẫn tạo mới.

## Testing / QA
- Seed dữ liệu mẫu để test.
- Chạy `npm run build` + chạy dev server, tự QA các luồng chính, chụp màn hình gửi lại.

## Ngoài phạm vi (YAGNI)
Đăng nhập, đồng bộ cloud, đa người dùng, đa tiền tệ, ngân sách nâng cao theo danh mục,
nhắc nhở/thông báo đẩy.
