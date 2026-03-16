# RFC 22: Income Budgets & Dashboard Sync

This RFC introduces support for "Income Budgets" (goal-tracking) and ensures the Dashboard remains in sync with all financial mutations.

## Pre-Specification Investigation
- **Dashboard Query Key:** I have confirmed that `src/app/[locale]/app/components/DashboardClient.tsx` uses the query key `['dashboard']`.

## Phase 1: Dashboard Invalidation & Consistency Audit

### Current Issue
While most forms correctly invalidate the `['dashboard']` key, the single-transaction delete action in `TransactionActions.tsx` (and potentially others) misses this step, causing the Dashboard stats to grow stale after deletions.

### Proposed Changes
Audit and update the following hooks/components to ensure they invalidate `['dashboard']`, `['transactions']`, and their own collection key on `onSuccess`:

#### [MODIFY] [TransactionActions.tsx](file:///Users/mateoibagon/Documents/GitHub/eterhub/src/app/[locale]/app/transactions/components/TransactionActions.tsx)
- Add `queryClient.invalidateQueries({ queryKey: ['dashboard'] })` to `handleDelete`.

#### [Audit] Mutation Hooks
- Verify `useAccountMutations`, `useBudgetMutations`, and `useCategoryMutations`. (Current audit shows they are mostly compliant, but will double-check during execution).

---

## Phase 2: Bi-directional Budgets (Income Goals vs Expense Limits)

### Database Schema Updates
Add a `budgetType` field to the `budgets` collection.

#### [MODIFY] [Budgets.ts](file:///Users/mateoibagon/Documents/GitHub/eterhub/src/payload/collections/finance/Budgets/Budgets.ts)
- **Field:** `budgetType`
- **Type:** `select`
- **Options:** `['expense', 'income']`
- **Default:** `'expense'` (Critical for backward compatibility).

### Financial Logic Updates
Refactor the transaction-to-budget synchronization hook.

#### [MODIFY] [updateBudgetSpend.ts](file:///Users/mateoibagon/Documents/GitHub/eterhub/src/payload/collections/finance/Transactions/hooks/updateBudgetSpend.ts)
- **Gatekeeper:** Remove the check `doc.type !== 'expense'`.
- **Targeting:** When looking up a matching budget:
  - Match `expense` transactions to `budgetType: 'expense'` budgets.
  - Match `income` transactions to `budgetType: 'income'` budgets.
- **Directional Math:**
  - If `budget.budgetType === 'expense'`: add `expense` amounts.
  - If `budget.budgetType === 'income'`: add `income` amounts.

### UI & UX Updates

#### [MODIFY] [BudgetForm.tsx](file:///Users/mateoibagon/Documents/GitHub/eterhub/src/app/[locale]/app/budget/components/BudgetForm.tsx)
- Add a Select field for `budgetType` (Expense vs Income).
- Update help text/labels based on the selected type.

#### [MODIFY] [Budget page](file:///Users/mateoibagon/Documents/GitHub/eterhub/src/app/[locale]/app/budget/page.tsx)
- Update the fetcher to include `income` transactions when calculating "actual spent" (now "actual progress").
- Update `BudgetCard` rendering logic:
  - **Expense Budgets:** Keep warning colors (Red/Yellow) as they approach 100%.
  - **Income Budgets:** Use "Goal" colors (Green) as they approach and exceed 100%.

## Verification Plan

### Automated Verification
- Run `pnpm build` to ensure no schema or type breaks.
- Mock an `income` budget and verify that an `income` transaction updates its total.

### Manual Verification
1. Create an "Income" budget for "Salary" category.
2. Add a Salary transaction.
3. Verify the Budget progress bar highlights in Green.
4. Delete a transaction from the Transactions page and verify the Dashboard total balance updates immediately.
