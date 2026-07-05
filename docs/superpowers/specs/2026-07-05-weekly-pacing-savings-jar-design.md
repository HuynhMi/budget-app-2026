# Thiết kế: Nhịp chi theo tuần + Hũ tiết kiệm thật

- **Ngày:** 2026-07-05
- **Trạng thái:** Đã duyệt thiết kế, chờ review spec
- **Xây trên:** hệ thống hạn mức danh mục sẵn có (`src/lib/budget.ts`, `BudgetScreen`, `HomeScreen`)

## Bối cảnh & mục tiêu

App hiện cho đặt hạn mức mỗi danh mục theo **tháng HOẶC tuần** (chọn 1) và hiển thị đã chi / còn lại / tỉ lệ. Người dùng muốn:

1. Đặt hạn mức **tháng** nhưng theo dõi **nhịp chi theo tuần**: mỗi danh mục "tuần này còn tiêu được bao nhiêu" để đi chợ / mua đồ không bị lố.
2. Thấy **tiết kiệm được bao nhiêu** khi tiêu ít hơn hạn mức, và gom phần dư vào một **hũ tiết kiệm thật** (chuyển tiền vào ví tiết kiệm) — tích luỹ dần theo thời gian.

## Quyết định đã chốt (từ brainstorming)

| Chủ đề | Quyết định |
|---|---|
| Phạm vi | Làm **cả hai**: nhịp tuần + hũ tiết kiệm |
| Dồn dư tuần | **Dồn sang tuần sau** — hạn mức tháng còn lại chia đều cho số tuần còn lại |
| Mốc tiết kiệm | Gom vào **hũ tiết kiệm** (tích luỹ) |
| Loại hũ | **Tiền thật** — chuyển vào ví tiết kiệm (`excludeFromTotal`) qua giao dịch Transfer |
| Thời điểm nạp | **Tự động cuối tháng** — banner gợi ý chốt khi mở app sang tháng mới |
| Ví nguồn | **Ví do người dùng chỉ định** trong dialog (nhớ lựa chọn lần trước) |

## Phần 1 — Nhịp chi theo tuần

### Công thức (dồn dư)

Chỉ áp dụng cho hạn mức `period: 'month'`. Với ngày tham chiếu `ref` (thường là hôm nay):

```
monthStart        = startOfMonth(ref)
monthEnd          = ngày cuối tháng của ref
weekStart         = max(startOfWeek(ref), monthStart)   // Thứ 2, kẹp trong tháng
weeksLeft         = ceil( soNgayInclusive(weekStart, monthEnd) / 7 )
spentBeforeWeek   = tổng chi danh mục trong [monthStart, weekStart − 1 ngày]
spentThisWeek     = tổng chi danh mục trong [weekStart, monthEnd] giao [weekStart, cuối tuần]
remainingMonth    = limit − spentBeforeWeek
allowanceThisWeek = weeksLeft > 0 ? remainingMonth / weeksLeft : remainingMonth
remainingThisWeek = allowanceThisWeek − spentThisWeek
```

**Hệ quả đúng ý người dùng:**
- Tiêu ít tuần này → `remainingMonth` lớn hơn cho các tuần còn lại → tuần sau được nhiều hơn.
- Tiêu lố → `remainingMonth` nhỏ đi → allowance các tuần sau tự giảm (có thể âm → hiện "Vượt tuần").

**Ví dụ:** Hạn mức Ăn uống 2.000.000đ/tháng, tháng 4 tuần.
- Tuần 1 tiêu 300k (allowance 500k) → dư 200k. Đầu tuần 2: remainingMonth = 1.700.000, weeksLeft = 3 → allowance tuần 2 ≈ 566.667đ.

### Hiển thị

- Trong `BudgetProgressRow` (dùng ở Trang chủ + màn Ngân sách), với hạn mức tháng thêm 1 dòng phụ dưới thanh tiến độ tháng:
  - 🟢 `Tuần này còn: 405.000đ` (remainingThisWeek ≥ 0)
  - 🔴 `Vượt tuần: −50.000đ` (remainingThisWeek < 0)
- Thanh tiến độ **tháng** vẫn là thông tin chính. Hạn mức đặt `period: 'week'` giữ nguyên như hiện tại (không thêm dòng phụ).

## Phần 2 — Hũ tiết kiệm thật

### Preview động lực (hằng ngày)

Thẻ nhỏ trên Trang chủ (khu Ngân sách): **"Dự kiến tiết kiệm tháng này: X"**

```
surplusThisMonth = Σ (theo hạn mức period='month') max(0, limit − spentInPeriod(month))
```

Càng nhịn ăn vặt/trà sữa số này càng lớn → thấy ngay, không đợi hết tháng. Chỉ hiện khi có ≥ 1 hạn mức tháng và surplus > 0.

### Chốt cuối tháng (auto sweep)

Khi mở app, kiểm tra **tháng liền trước**:

```
prevRef  = ngày cuối tháng trước
monthKey = 'YYYY-MM' của prevRef
điều kiện hiện banner:
  - có ≥ 1 hạn mức period='month'
  - chưa có SavingsSweep nào với month === monthKey
  - surplus(prevRef) > 0
```

Banner:
> "Tháng 6 bạn tiêu ít hơn hạn mức **X**. Bỏ vào hũ tiết kiệm?"
> [Ví nguồn ▾] [Ví tiết kiệm ▾] · **[Bỏ vào hũ]** · [Bỏ qua]

- **Ví nguồn:** danh sách ví không phải tiết kiệm; mặc định lựa chọn lần trước (lưu trong localStorage), lần đầu = ví đầu tiên.
- **Ví đích:** danh sách ví `excludeFromTotal`; nếu chưa có ví nào → thay nút bằng gợi ý "Tạo ví tiết kiệm trước" dẫn sang màn Ví.
- **[Bỏ vào hũ]** → tạo `Transfer` (from → to, amount = surplus, note "Tiết kiệm tháng MM/YYYY") + ghi `SavingsSweep{ status:'done', transferId }`. Kết quả: "Có thể chi tiêu" giảm, 🔒 Tiết kiệm tăng.
- **[Bỏ qua]** → ghi `SavingsSweep{ status:'skipped', amount: surplus }` để không hỏi lại tháng đó.

Nếu surplus ≤ 0: không hiện banner, không ghi gì (rẻ, tính lại mỗi lần mở app).

## Phần 3 — Thay đổi kỹ thuật

### Kiểu dữ liệu (`src/types.ts`)

```ts
export interface SavingsSweep {
  id: string
  month: string          // 'YYYY-MM'
  amount: number         // surplus đã chốt
  fromWalletId?: string  // chỉ khi status='done'
  toWalletId?: string
  transferId?: string    // Transfer đã tạo (để truy vết / hoàn tác)
  status: 'done' | 'skipped'
  createdAt: number
}
// AppData thêm: savingsSweeps: SavingsSweep[]
```

### Tầng DB (`src/db/index.ts`)

- `DB_VERSION 2 → 3`; trong `upgrade`: `if (oldVersion < 3) db.createObjectStore('savingsSweeps', { keyPath: 'id' })`. Migration cộng dồn, không đụng dữ liệu cũ.
- Thêm `savingsSweeps` vào `loadAll`, `resetAll`, `exportJSON`/`importJSON`, và `Stores` type.
- `dbApi`: `putSweep`, (không cần del cho v1).

### Store (`src/state/store.tsx`)

- Expose `savingsSweeps: SavingsSweep[]`.
- `recordSweep(sweep)` — ghi sweep; nếu `status='done'` cũng gọi `saveTransfer` (hoặc nhận transferId do caller tạo trước). Chọn: caller tạo Transfer trước rồi truyền `transferId` vào `recordSweep` để giữ store method đơn giản.

### Logic (`src/lib/`)

- `budget.ts`: thêm `weeklyPacing(budget, transactions, ref): { allowanceThisWeek, spentThisWeek, remainingThisWeek, weeksLeft }`.
- `savings.ts` (mới):
  - `monthlySurplus(budgets, transactions, ref): number`
  - `monthKeyOf(ref): string`
  - `pendingSweep(now, budgets, transactions, sweeps): { monthKey, amount } | null`

### UI

- `BudgetProgressRow.tsx`: nhận thêm pacing (hoặc tự tính) → render dòng tuần cho hạn mức tháng.
- `HomeScreen.tsx`: thẻ "Dự kiến tiết kiệm tháng này"; mount banner chốt hũ.
- Component mới `SavingsSweepBanner.tsx`: dialog/banner chốt cuối tháng (chọn ví nguồn/đích, xác nhận/bỏ qua).

### Helper ngày tháng (`src/lib/dates.ts`)

- Có thể thêm `daysInclusive(a, b)` nếu cần cho `weeklyPacing` (hoặc tính cục bộ trong budget.ts).

## Kiểm thử (TDD, khớp `*.test.ts` sẵn có)

- `budget.test.ts` (bổ sung) — `weeklyPacing`:
  - Đầu tháng, chưa tiêu → allowance = limit / số tuần.
  - Dồn dư: tuần 1 tiêu ít → allowance tuần 2 tăng.
  - Tiêu lố tháng → remainingThisWeek âm.
  - `weekStart` rơi vào tháng trước (ngày 1 giữa tuần) → kẹp đúng, weeksLeft đúng.
  - Tuần cuối tháng → weeksLeft = 1, allowance = toàn bộ phần còn lại.
- `savings.test.ts` (mới):
  - `monthlySurplus` chỉ tính hạn mức tháng, bỏ qua tuần; kẹp `max(0, …)`.
  - `pendingSweep`: trả tháng trước khi đủ điều kiện; null khi đã có sweep (done/skipped); null khi surplus ≤ 0; null khi không có hạn mức tháng.

## Ngoài phạm vi (YAGNI v1)

- Hũ ảo / so với "thói quen trung bình".
- Sweep cho hạn mức đặt-theo-tuần.
- Thông báo đẩy, biểu đồ lịch sử hũ, hoàn tác sweep (đã lưu `transferId` để mở rộng sau).
- Chốt nhiều tháng bị bỏ lỡ cùng lúc — v1 chỉ xét tháng liền trước.
