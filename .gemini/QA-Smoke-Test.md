# EterFlow — QA Smoke Test Script (End-to-End)

## Pre-requisites
- Live Vercel Production URL
- Active Supabase (Postgres), Upstash (Redis), and Brevo (Email) connections
- 1 valid, unused Invitation Code
- A test email address you can access
- Chrome or Chromium-based browser with DevTools

---

## 1. Auth & Rate Limiting

- [ ] **Invitation Code Burn Trap**
  - **Action:** Attempt to register a member using an invalid or made-up code.
  - **Expected Result:** UI shows an error; registration is blocked.
  - **Action:** Register successfully with the valid Invitation Code.
  - **Expected Result:** Registration succeeds and user enters EterFlow.
  - **Action:** Sign out, then try to register a *second* new member using the *same* Invitation Code.
  - **Expected Result:** Registration fails because the code is marked as "Used". The atomic transaction prevents partial account creation.

- [ ] **Upstash Rate Limiting**
  - **Action:** On the `/login` page, enter incorrect credentials 6 times consecutively in rapid succession.
  - **Expected Result:** After hitting the threshold, the UI (or API response) returns a rate-limit error (e.g., 429 Too Many Requests).

- [ ] **Forgot / Reset Password Loop & i18n Emails**
  - **Action:** Navigate to the Forgot Password page. Enter the registered email.
  - **Expected Result:** A generic success message appears (Email Enumeration Prevention).
  - **Action:** Check the email inbox. 
  - **Expected Result:** Email arrives via Brevo. The language (Title, Body) automatically matches the `preferredLocale` saved during registration.
  - **Action:** Click the reset link, enter matching new passwords.
  - **Expected Result:** Success message appears; user is redirected safely to `/login`.
  - **Action:** Log in with the new password.
  - **Expected Result:** Login succeeds, Next.js handles the `payload-member-token` HttpOnly cookie without auth-state bounce loops.

---

## 2. Access Control

- [ ] **Admin Panel Isolation**
  - **Action:** Log in as the standard Member created in Step 1.
  - **Action:** Force-navigate your browser URL bar to `/admin`.
  - **Expected Result:** Access is denied. Payload either redirects standard members to an unauthorized page or kicks them back to the app. Standard users must not load the CMS admin dashboard.

---

## 3. Concurrency (The Slow 3G Test)

- [ ] **Double-Click Deduction Prevention**
  - **Action:** Open Chrome DevTools -> **Network** tab -> **Throttling** dropdown -> Select **Slow 3G**.
  - **Action:** Fill out a new Expense transaction (e.g., $100). Quickly double-click or spam-click the "Save Transaction" button while the request hangs.
  - **Expected Result:** The UI should disable the button on the first click. Behind the scenes, the Payload backend transaction hooks must guarantee that $100 is deducted *exactly once* from the Account/Budget. No duplicate rows in the DB.
  - **Action:** Turn off Network Throttling.

---

## 4. Input Sanitization

- [ ] **Negative Amount Test**
  - **Action:** Attempt to create an Income or Expense transaction with the amount `-50000`.
  - **Expected Result:** Form validation prevents submission, or the API rejects it. Account balances do not change.
  
- [ ] **Zero Amount Test**
  - **Action:** Attempt to create a transaction with the amount `0`.
  - **Expected Result:** Rejected by validation.

- [ ] **Integer Overflow Test**
  - **Action:** Attempt to create a transaction with the amount `999999999999`.
  - **Expected Result:** Handled gracefully. Shows a validation error (max value exceeded) rather than crashing the database. Balances remain intact.

---

## 5. The Timezone Trap

- [ ] **Bogotá UTC-5 Day Bleed Test**
  - **Action:** Test right around midnight UTC (which is 7:00 PM Bogotá time) OR wait until 11:50 PM local Bogotá time.
  - **Action:** Create a standard transaction.
  - **Expected Result:** The transaction must register and display on the *current* local day in the UI arrays/charts, rather than bleeding into "tomorrow" (its UTC date).

---

## 6. Soft Delete Integrity

- [ ] **Balance Revert on Delete**
  - **Action:** Note the exact current balance of a specific Account.
  - **Action:** Create a new Expense transaction for $50.
  - **Expected Result:** Account balance decreases by exactly $50.
  - **Action:** Delete the transaction from the Dashboard/Transactions list.
  - **Expected Result:** The Account balance *reverts perfectly* (goes back up by $50). The transaction disappears from all user UI views.
  - **Action:** Check Supabase directly (via SQL or Payload Admin).
  - **Expected Result:** The transaction row still exists in the database for audit integrity, but its `status` is set to `deleted` (or `deletedAt` is populated).

---

## 7. CRON Security

- [ ] **Unauthorized Execution Prevention**
  - **Action:** Open a new Incognito Window or use a bash terminal.
  - **Action:** Hit the Vercel URL directly: `GET https://[YOUR-VERCEL-URL]/api/cron/process-scheduled` WITHOUT passing the secure CRON secret or bearer token.
  - **Expected Result:** The server returns `401 Unauthorized` (or 403 Forbidden). The scheduled transactions are *not* processed.
