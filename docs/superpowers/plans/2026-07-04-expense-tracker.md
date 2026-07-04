# App Quản lí Chi tiêu — Implementation Plan

> **For agentic workers:** Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an offline PWA expense tracker (wallets, income/expense, categories, transfers, history, line-chart reports, and a shopping-scan mode).

**Architecture:** Client-only React SPA. All data in IndexedDB via `idb`. Pure functions for money/balance math (unit-tested). Recharts for charts. Tesseract.js + @zxing/browser for scan mode.

**Tech Stack:** React 18, Vite, TypeScript, Tailwind CSS, Recharts, idb, Tesseract.js, @zxing/browser, vitest.

## Global Constraints
- Currency: VND (₫), integer amounts, thousands separator, no decimals.
- Offline-first, no login, no backend.
- Vietnamese UI copy.
- Mobile-first layout (max-width ~430px, centered).

---

### Task 1: Project scaffold
- Vite React-TS app, Tailwind, folder structure (`src/db`, `src/lib`, `src/components`, `src/screens`, `src/state`).
- PWA manifest + service worker (vite-plugin-pwa).
- Deliverable: `npm run dev` shows a blank themed shell.

### Task 2: Data layer (`src/db`)
- IndexedDB schema (wallets, categories, transactions, transfers) via `idb`.
- CRUD helpers. Seed default categories on first run.
- Export/import JSON.

### Task 3: Money & balance logic (`src/lib`) — TESTED
- `formatVND(n)`, `parseVND(s)`.
- `walletBalance(wallet, txns, transfers)`.
- `totalBalance(...)`, aggregation for reports (by week/month/year, income vs expense, by category).
- Vitest unit tests for these pure functions.

### Task 4: App state + routing
- Context/store loading data from db, refresh on mutation.
- Bottom-nav routing: Home, History, Add, Reports, Wallets (+ Scan, Categories sub-routes).

### Task 5: Shared UI + theme
- Card, Button, bottom nav, top bar, gradient theme, icons, empty states, modal/sheet.

### Task 6: Wallets screen + transfer
- CRUD wallets; transfer between wallets; delete guard.

### Task 7: Add transaction screen
- Name, amount, date, wallet, category, income/expense toggle.

### Task 8: Categories screen
- CRUD income/expense categories (icon + color).

### Task 9: Home screen
- Total balance, wallet cards, recent transactions, mini expense chart, + and Scan buttons.

### Task 10: History screen
- List txns + transfers; filters All/Today/Week/Month/Year, wallet, category.

### Task 11: Reports screen
- Line chart week/month/year, income vs expense, category breakdown.

### Task 12: Scan (shopping) mode
- Photo → Tesseract OCR of price → confirm/edit → running list + running total.
- Optional spend cap with over-limit warning.
- QR/barcode scan for item name.
- "Add to today's expenses" commits total as one expense txn.

### Task 13: QA pass
- Seed sample data, run build, drive main flows, screenshot, fix issues.
