# Đưa app lên CH Play (Google Play) — hướng dẫn từng bước

App là PWA nên ta bọc thành app Android bằng **TWA** (Trusted Web Activity) qua **PWABuilder**.
Tổng thời gian: ~1–2 giờ (chưa kể Google duyệt). Chi phí: **25 USD** (tài khoản Play, đóng 1 lần).

Mọi thứ cần thiết đã được chuẩn bị sẵn trong repo:
- `public/privacy.html` — trang chính sách bảo mật (Play bắt buộc)
- `public/.well-known/assetlinks.json` — mẫu xác minh domain (cần điền fingerprint ở bước 4)
- `public/_redirects` — cấu hình SPA cho Netlify
- `store-assets/` — icon, feature graphic 1024×500, 4 ảnh chụp màn hình
- manifest đã đủ chuẩn (id, start_url, scope, icons 192/512 + maskable)

---

## Bước 1 — Deploy PWA lên domain HTTPS công khai
TWA **bắt buộc** trỏ tới 1 URL HTTPS thật. Chọn 1 host miễn phí:

**Cách dễ nhất — Netlify (kéo-thả):**
1. `npm run build` → tạo thư mục `dist/`.
2. Vào https://app.netlify.com/drop → kéo-thả thư mục `dist/` vào.
3. Nhận URL dạng `https://ten-ngau.netlify.app`. (Có thể đổi tên hoặc gắn domain riêng.)

**Hoặc Vercel / Cloudflare Pages / GitHub Pages** — đều được. Lưu ý nếu host ở
thư mục con (GitHub Pages kiểu `user.github.io/repo`) thì phải đặt `base: '/repo/'`
trong `vite.config.ts`. Host ở gốc domain thì giữ nguyên.

> Sau bước này mở thử URL trên điện thoại → phải cài được bằng "Thêm vào màn hình chính"
> và camera QR chạy được (vì đã có HTTPS).

## Bước 2 — Kiểm tra PWA hợp lệ
Vào https://www.pwabuilder.com → dán URL vừa deploy → bấm **Start**.
Điểm manifest/service worker phải xanh (repo đã chuẩn bị đủ). Sửa nếu nó báo thiếu gì.

## Bước 3 — Tạo gói Android (.aab)
1. Trong PWABuilder, bấm **Package for stores → Android → Google Play**.
2. Điền:
   - **Package ID**: ví dụ `com.tenban.chitieu` (đặt cố định, không đổi về sau).
   - **App name**: Quản lí Chi tiêu
   - **Launcher name**: Chi tiêu
3. Bấm **Generate**. Tải về file zip gồm:
   - `app-release-bundle.aab` — file upload lên Play.
   - `signing-key-info` (mật khẩu keystore) và **`assetlinks.json`** đã có SHA-256 thật.
   - **GIỮ KỸ keystore + mật khẩu** — mất là không cập nhật app được nữa.

## Bước 4 — Xác minh domain (bỏ thanh URL trình duyệt)
1. Mở `assetlinks.json` mà PWABuilder tạo (đã có `sha256_cert_fingerprints` thật).
2. Thay nội dung file `public/.well-known/assetlinks.json` trong repo bằng nội dung đó
   (hoặc chỉ cần đảm bảo URL `https://domain/.well-known/assetlinks.json` trả về đúng nội dung này).
3. Deploy lại (lặp Bước 1). Kiểm tra mở được: `https://domain-cua-ban/.well-known/assetlinks.json`.

## Bước 5 — Tạo tài khoản & app trên Play Console
1. Đăng ký https://play.google.com/console (**25 USD/1 lần**).
2. **Create app** → tên, ngôn ngữ (Tiếng Việt), loại **App**, miễn phí.
3. Điền phần bắt buộc:
   - **Chính sách bảo mật**: dán URL `https://domain-cua-ban/privacy.html`.
   - **App access, Ads (không quảng cáo), Content rating** (làm bảng câu hỏi → phân loại).
   - **Target audience**, **Data safety**: khai **không thu thập dữ liệu** (app chạy offline).
4. **Store listing**:
   - Mô tả ngắn + đầy đủ (mẫu bên dưới).
   - **App icon** 512×512: `store-assets/` (dùng `icon-512.png` trong `public/`).
   - **Feature graphic** 1024×500: `store-assets/feature-graphic.png`.
   - **Screenshots điện thoại**: `store-assets/01-home.png … 04-scan.png` (tối thiểu 2 ảnh).

## Bước 6 — Upload & phát hành
1. **Release → Production** (hoặc Testing trước) → **Create release**.
2. Upload `app-release-bundle.aab`.
3. Điền ghi chú phiên bản → **Review** → **Rollout**.

> ⚠️ **Lưu ý chính sách mới của Google:** tài khoản cá nhân (personal) tạo gần đây phải
> chạy **Closed testing với ít nhất 12 người test trong 14 ngày liên tục** trước khi được
> mở **Production**. Tài khoản tổ chức (organization) thì không bị yêu cầu này. Hãy tạo
> bản **Closed testing** trước, mời email người test, chờ đủ điều kiện rồi mới lên Production.

Google duyệt thường vài giờ đến vài ngày.

---

## Mẫu nội dung Store listing (chép dùng luôn)

**Tên:** Quản lí Chi tiêu

**Mô tả ngắn (tối đa 80 ký tự):**
> Quản lí ví, thu chi, ngân sách & quét giá — gọn nhẹ, chạy offline, riêng tư.

**Mô tả đầy đủ:**
> Quản lí Chi tiêu giúp bạn nắm dòng tiền cá nhân một cách nhẹ nhàng:
>
> • Nhiều ví (tiền mặt, ngân hàng, tiết kiệm) — tách rõ tiền có thể chi tiêu và tiền để dành
> • Ghi thu/chi nhanh theo danh mục, chuyển tiền giữa các ví
> • Đặt hạn mức chi theo danh mục (tháng/tuần) — cảnh báo khi sắp/đã vượt
> • Thống kê biểu đồ theo tuần/tháng/năm
> • Quét giá giỏ hàng: cộng dồn khi đi siêu thị để không mua quá tiền
> • Sao lưu/khôi phục bằng file
>
> Toàn bộ dữ liệu lưu trên máy bạn — không tài khoản, không quảng cáo, không theo dõi.
> Dùng được cả khi không có mạng.

---

## Không muốn qua Play? (dùng ngay)
Chỉ cần làm **Bước 1**, rồi trên điện thoại mở URL → Chrome ⋮ → **Thêm vào Màn hình chính**.
Xong — chạy như app, offline, miễn phí, không cần 25 USD.
