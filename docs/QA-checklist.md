# QA Checklist — App Quản lí Chi tiêu

Cách dùng: chạy `npm run dev`, mở trên điện thoại/máy, làm lần lượt từng bước. Cột "Kết quả mong đợi" là chuẩn để đối chiếu. Nên bắt đầu bằng **TC-00 Reset** để có dữ liệu sạch.

## 0. Khởi tạo & dữ liệu mặc định
| # | Hành động | Kết quả mong đợi |
|---|---|---|
| TC-00 | Vào Ví → Sao lưu → "Đặt lại dữ liệu về mặc định" → xác nhận | Về đúng **2 ví** (Tiền mặt, Ngân hàng) + **12 danh mục**, không trùng lặp |
| TC-01 | Tải lại trang (F5) nhiều lần | Vẫn đúng 2 ví / 12 danh mục — **không nhân đôi** |
| TC-02 | Mở lần đầu khi chưa có giao dịch | Trang chủ hiện trạng thái rỗng "Chưa có giao dịch. Bấm + để thêm." |

## 1. Ví
| # | Hành động | Kết quả mong đợi |
|---|---|---|
| TC-10 | Ví → "＋ Thêm ví", nhập tên "Tiết kiệm", số dư 2.000.000, chọn icon+màu → Lưu | Thêm **đúng 1 ví**, tổng số dư tăng 2tr |
| TC-11 | Bấm vào 1 ví → đổi tên/màu → Lưu | Cập nhật đúng, không tạo ví mới |
| TC-12 | Thêm ví để trống tên → Lưu | Báo lỗi "Nhập tên ví", không lưu |
| TC-13 | Xoá 1 ví **chưa có** giao dịch | Xoá ngay, không hỏi |
| TC-14 | Xoá 1 ví **đã có** giao dịch | Hiện cảnh báo xác nhận trước khi xoá |
| TC-15 | Nhập số tiền dạng "1,5tr" hoặc "500k" ở ô số dư | Hiểu đúng = 1.500.000 / 500.000 |

## 2. Danh mục
| # | Hành động | Kết quả mong đợi |
|---|---|---|
| TC-20 | Ví → "🏷️ Danh mục" → tab Chi tiêu → "＋ Thêm" → tạo "Cà phê" | Danh mục mới xuất hiện ở tab Chi tiêu |
| TC-21 | Tab Thu nhập → thêm danh mục thu | Chỉ hiện ở tab Thu nhập, không lẫn sang Chi |
| TC-22 | Sửa icon/màu 1 danh mục | Cập nhật đúng, giao dịch cũ dùng danh mục đó đổi màu theo |
| TC-23 | Xoá danh mục đang được dùng | Cảnh báo xác nhận; sau khi xoá, giao dịch cũ hiện icon "🏷️/Khác" |

## 3. Giao dịch (thu / chi)
| # | Hành động | Kết quả mong đợi |
|---|---|---|
| TC-30 | Bấm ＋ → Chi tiêu, 85.000, "Ăn trưa", chọn ví + "Ăn uống" → Lưu | Ghi khoản chi; số dư ví giảm 85.000; hiện ở Gần đây (màu hồng, dấu −) |
| TC-31 | Bấm ＋ → Thu nhập, 15.000.000, "Lương", chọn "Lương" → Lưu | Ghi khoản thu; số dư ví tăng; hiện màu xanh, dấu + |
| TC-32 | Thêm giao dịch để trống số tiền hoặc = 0 → Lưu | Báo "Nhập số tiền hợp lệ" |
| TC-33 | Đổi ngày về hôm qua/tháng trước rồi lưu | Giao dịch nằm đúng ngày đã chọn trong Lịch sử |
| TC-34 | Không nhập tên → Lưu | Tự đặt tên "Chi tiêu"/"Thu nhập", vẫn lưu được |
| TC-35 | Lịch sử → bấm 1 giao dịch → sửa số tiền → Lưu | Số dư & thống kê cập nhật lại đúng |
| TC-36 | Sửa giao dịch → "Xoá giao dịch" → xác nhận | Giao dịch biến mất, số dư hồi lại |

## 4. Chuyển tiền giữa ví
| # | Hành động | Kết quả mong đợi |
|---|---|---|
| TC-40 | Ví → "🔄 Chuyển tiền", từ A → B, 500.000 → Chuyển | Ví A −500k, ví B +500k, **tổng số dư không đổi** |
| TC-41 | Chọn cùng 1 ví cho cả 2 bên | Báo "Chọn hai ví khác nhau" |
| TC-42 | Chỉ có 1 ví | Nút "Chuyển tiền" bị mờ/không bấm được |
| TC-43 | Xem Lịch sử | Có dòng "Chuyển tiền" A → B, không tính là thu/chi trong thống kê |

## 5. Lịch sử & bộ lọc
| # | Hành động | Kết quả mong đợi |
|---|---|---|
| TC-50 | Vào Lịch sử | Giao dịch nhóm theo ngày, mới nhất trên cùng; "Hôm nay" hiển thị đúng |
| TC-51 | Bấm lọc Hôm nay / Tuần / Tháng / Năm | Danh sách lọc đúng theo kỳ |
| TC-52 | Lọc theo từng ví | Chỉ hiện giao dịch của ví đó (kể cả chuyển tiền liên quan) |
| TC-53 | Lọc mà không có kết quả | Hiện "Không có giao dịch nào." |

## 6. Thống kê (biểu đồ)
| # | Hành động | Kết quả mong đợi |
|---|---|---|
| TC-60 | Thống kê → Tháng | Line chart 2 đường Thu (xanh) / Chi (hồng); trục ngày trong tháng |
| TC-61 | Chuyển Tuần / Năm | Trục đổi theo T2..CN / T1..T12; số liệu gộp đúng |
| TC-62 | Chạm/hover 1 điểm trên chart | Tooltip hiện số tiền định dạng VND |
| TC-63 | Xem "Chi tiêu theo danh mục" | Thanh ngang giảm dần, tổng khớp với tổng chi kỳ đó |
| TC-64 | 2 thẻ Thu nhập / Chi tiêu | Số khớp với tổng trong kỳ đang chọn |

## 7. Ngân sách (hạn mức theo danh mục)
| # | Hành động | Kết quả mong đợi |
|---|---|---|
| TC-70 | Thống kê → thẻ "🎯 Ngân sách danh mục" → "Đặt hạn mức mới" | Mở màn Ngân sách |
| TC-71 | Đặt "Ăn uống" 3.000.000 / Tháng → Lưu | Xuất hiện thẻ với thanh tiến độ đã chi / 3tr |
| TC-72 | Khi đã chi < 80% hạn mức | Thanh **xanh**, ghi "Còn lại …" |
| TC-73 | Khi đã chi 80–100% | Thanh **cam**, ghi "Sắp hết! Còn …" |
| TC-74 | Khi chi vượt 100% | Thanh **đỏ**, ghi "⚠️ Vượt hạn mức …" |
| TC-75 | Thẻ ngân sách ở Thống kê | Hiện chip "N hạn mức", "⚠️ x vượt mức", "y sắp hết" đúng số |
| TC-76 | Thêm giao dịch chi vào danh mục có hạn mức, số tiền làm vượt | Trong form hiện cảnh báo đỏ "🚫 Vượt hạn mức tháng!" **trước khi** lưu |
| TC-77 | Đổi hạn mức sang **Tuần** | Tính "đã chi" chỉ trong tuần hiện tại (T2–CN) |
| TC-78 | Mỗi danh mục chỉ đặt 1 hạn mức | Danh mục đã có hạn mức không xuất hiện lại ở "Đặt hạn mức mới" |
| TC-79 | Xoá 1 hạn mức | Biến mất khỏi danh sách; danh mục có thể đặt lại |

## 8. Quét giá / Giỏ hàng (tính năng riêng)
| # | Hành động | Kết quả mong đợi |
|---|---|---|
| TC-80 | Trang chủ → "📷 Quét giá" | Mở màn Giỏ hàng, tổng = 0 |
| TC-81 | Nhập tay tên "Sữa" + giá 45.000 → "Thêm vào giỏ" | Vào danh sách, "Tổng tạm tính" = 45.000 |
| TC-82 | Thêm vài món nữa | Tổng cộng dồn đúng |
| TC-83 | Đặt "Hạn mức chi" 300.000, thêm cho tổng > 300k | Thanh + chữ chuyển **vàng**, "⚠️ Vượt hạn mức …" |
| TC-84 | Bấm ✕ xoá 1 món | Tổng giảm tương ứng |
| TC-85 | "📷 Chụp giá" → chọn/chụp ảnh bảng giá | OCR đọc số, điền vào ô Giá; cho sửa lại trước khi thêm |
| TC-86 | Ảnh không có số / OCR không chắc | Báo "Không đọc được số… nhập tay", **không** tự thêm số sai |
| TC-87 | "🔳 Quét QR" (điện thoại có camera, localhost/HTTPS) | Mở camera; quét mã → điền vào ô Tên món |
| TC-88 | Quét QR khi bị từ chối quyền camera | Hiện "Không mở được camera… nhập tay" |
| TC-89 | "✅ Thêm vào chi tiêu hôm nay" → chọn ví/danh mục → Lưu | Ghi **1 khoản chi** = tổng giỏ, ngày hôm nay; quay về, giỏ trống |
| TC-8A | Rời màn quét mà **không** bấm nút trên | Không có khoản chi nào được ghi (giỏ chỉ là bảng tạm) |

## 9. Sao lưu / Khôi phục
| # | Hành động | Kết quả mong đợi |
|---|---|---|
| TC-90 | Ví → Sao lưu → "⬇️ Xuất file" | Tải file `sao-luu-chi-tieu-YYYY-MM-DD.json` |
| TC-91 | "⬆️ Nhập file" chọn file vừa xuất → xác nhận | Dữ liệu khớp lại như lúc xuất (ghi đè) |
| TC-92 | Nhập file JSON hỏng | Báo "File không hợp lệ", không làm mất dữ liệu hiện tại |
| TC-93 | "🗑️ Đặt lại dữ liệu" → xác nhận | Xoá sạch, tạo lại 2 ví + 12 danh mục mặc định |

## 10. PWA / môi trường
| # | Hành động | Kết quả mong đợi |
|---|---|---|
| TC-A0 | Trên điện thoại: "Thêm vào màn hình chính" | Cài như app, mở toàn màn hình |
| TC-A1 | Tắt mạng rồi mở lại app (đã mở 1 lần) | App vẫn chạy, dữ liệu còn (offline) |
| TC-A2 | Nhập số tiền rất lớn / dán chữ vào ô số | Không crash; ô số chỉ nhận số hợp lệ |
| TC-A3 | Kiểm tra Console trình duyệt khi thao tác | **Không có lỗi đỏ** |

---
### Ưu tiên smoke test nhanh (5 phút)
TC-00 → TC-10 → TC-30 → TC-40 → TC-60 → TC-71 → TC-76 → TC-81/83 → TC-89 → TC-A3
