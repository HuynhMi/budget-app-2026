# Quản lí Chi tiêu 💜

App web quản lí chi tiêu cá nhân, chạy trên điện thoại (PWA), **offline, không cần đăng nhập, không cần server**. Dữ liệu lưu ngay trên máy (IndexedDB).

## Tính năng
- 👛 **Ví**: tạo/sửa/xoá ví, xem số dư từng ví + tổng.
- ➕ **Giao dịch**: thu / chi với tên, số tiền, ngày, ví, danh mục.
- 🔄 **Chuyển tiền** giữa các ví.
- 🏷️ **Danh mục** thu & chi (icon + màu), thêm/sửa/xoá.
- 🕘 **Lịch sử**: lọc theo Hôm nay/Tuần/Tháng/Năm + theo ví, nhóm theo ngày.
- 📊 **Thống kê**: biểu đồ line thu/chi theo tuần–tháng–năm, phân tích theo danh mục.
- 🎯 **Ngân sách**: đặt hạn mức chi mỗi danh mục theo **tháng/tuần** (VD Ăn uống tối đa 3tr/tháng), cảnh báo khi sắp/đã vượt — cảnh báo cả lúc đang nhập giao dịch.
- 📷 **Quét giá / Giỏ hàng** (tính năng riêng): chụp ảnh giá → OCR đọc số, hoặc quét QR/mã vạch; cộng dồn tổng đang chạy, đặt hạn mức cảnh báo khi vượt; chỉ khi bấm **"Thêm vào chi tiêu hôm nay"** tổng mới được ghi thành 1 khoản chi.
- ⬇️⬆️ **Sao lưu**: xuất/nhập file JSON (mục Ví).

## Chạy thử
```bash
npm install
npm run dev        # mở http://localhost:5173
```
Trên điện thoại: chạy `npm run dev -- --host`, rồi mở địa chỉ IP máy tính hiện ra từ trình duyệt điện thoại (cùng WiFi). Bấm "Thêm vào màn hình chính" để dùng như app.

## Lệnh khác
```bash
npm run build      # build production (thư mục dist/)
npm run preview    # xem thử bản build
npm test           # chạy 22 unit test (tiền, số dư, thống kê, ngân sách, OCR)
npm run typecheck  # kiểm tra TypeScript
```

## Ghi chú kỹ thuật
- **OCR** dùng Tesseract.js chạy trong trình duyệt; lần đầu cần tải bộ nhận dạng (cần mạng lần đầu). OCR có thể đọc sai vài số nên **luôn cho sửa lại** trước khi cộng.
- **Camera QR** cần trang chạy qua HTTPS hoặc localhost và cấp quyền camera. Nếu không có camera, có thể nhập tay.
- Stack: React + Vite + TypeScript + Tailwind CSS + Recharts + idb + Tesseract.js + @zxing.
