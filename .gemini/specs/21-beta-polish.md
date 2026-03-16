# RFC 21: Beta Polish & Financial Logic

This RFC addresses critical functional bugs in the scheduled transactions and budget modules, improves numeric input UX, and polishes the visual reports and translations for the Beta launch.

## Phase 1: Critical Core (Functionality & Logic)

### 1. Scheduled Transactions Modal Fix
- **Diagnosis:** 
  - There is a naming mismatch: the Page uses `?addScheduled=true` but the Modal expects `?addSub=true`.
  - The `ScheduledTransactionModal` is not currently rendered in `scheduled-transactions/page.tsx`.
  - It uses `useSearchParams()` without a surrounding `Suspense` boundary, which can cause hydration issues.
- **Proposed Solution:**
  - Update `ScheduledTransactionModal.tsx` to use `addScheduled` as the trigger key.
  - Render `<ScheduledTransactionModal />` in `scheduled-transactions/page.tsx`.
  - Wrap the modal in a `<Suspense>` boundary in a new wrapper or directly in the page to satisfy Next.js requirements for `useSearchParams`.

### 2. Auto-Budget Spending Update
- **Diagnosis:** 
  - `updateBudgetSpend.ts` currently only updates the `currentSpend` of a budget if the transaction has an explicit `budget` relationship field populated.
  - Transactions created via `TransactionForm` or imported via CSV only have a `category`.
- **Proposed Solution:**
  - Modify `updateBudgetSpend.ts` to perform a lookup if `doc.budget` is missing.
  - It will search for a budget where `category` === `doc.category`, `owner` === `doc.owner`, and `month` === `doc.date` (formatted as YYYY-MM).
  - This ensures that *any* expense in a categorized month automatically counts against the relevant budget.

---

## Phase 2: High-Impact UX (Forms & Inputs)

### 1. Systemic Numeric Input (`<MoneyInput />`)
- **Proposed Solution:** Create a reusable `MoneyInput` component.
  - Uses `type="text"` and `inputMode="decimal"` for better mobile keyboard support.
  - Handles commas and decimals gracefully.
  - Removes the confusing "static zero" and native browser arrows.
  - **Locations to update:** `TransactionForm.tsx`, `AccountForm.tsx`, `BudgetForm.tsx`, and `ScheduledTransactionForm.tsx`.

### 2. Double-Submit Prevention
- **Proposed Solution:** Standardize `disabled={form.state.isSubmitting}` across all forms.
- Verified that `AccountForm`, `BudgetForm`, and `ScheduledTransactionForm` have it. I will ensure `TransactionForm` also implements it correctly with a "Saving..." loading state.

### 3. Budget Form Reactivity
- **Proposed Solution:** Use `form.Subscribe` in `BudgetForm.tsx` to ensure the `recurrenceDuration` field visibility is perfectly reactive to the `recurrenceType` selection.

### 4. Account Initial Balance Helper
- **Proposed Solution:** Add a distinct helper text under the balance field in `AccountForm.tsx` when in "Create" mode: *"Enter your current actual bank balance. This will be the starting point for your tracking."*

---

## Phase 3: Visual Polish & Copy

### 1. Reports Layout
- **Proposed Solution:** Update `src/app/[locale]/app/reports/page.tsx` to stack the Pie Chart (Spending) and Bar Chart (Income vs Expense) vertically.
- Use a single-column layout for charts on all screen sizes to give them full-width visibility and better readability.

### 2. Missing Translations (i18n)
- **Proposed Solution:** Populate missing keys in `en.json` and `es.json`:
  - `Miru.transactions.transfer`: "Transfer" / "Transferencia"
  - `Miru.categories.title`: "Categories" / "Categorías"
  - Recharts labels (Income, Expense, Spending).
  - Budget recurrence options labels.

### 3. Import View Cleanup
- **Proposed Solution:** Translate the AI Magic Prompt instructions into English for the `en.json` namespace.
- Ensure the bulk import helper text in `ImportClient.tsx` is fully bilingual.

## Verification Plan

### Automated Tests
- Run `pnpm test` to ensure no regression in budget logic.
- Run `npx tsc --noEmit` to verify type safety of the new hook logic.

### Manual Verification
1. Create a transaction for a category that has a budget; verify the budget progress bar updates.
2. Navigate to `?addScheduled=true` and verify the modal opens.
3. Verify numeric input behavior on mobile (decimal keyboard).
4. Verify charts are stacked vertically in Reports.
