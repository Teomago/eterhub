# RFC 18: Rebrand & i18n Finalization

This document outlines the technical specification for finalizing the branding of the project to "Heionhub" and its finance app to "Miru", as well as completing the internationalization (i18n) of the finance app.

## 1. Complete Rebrand (Heionhub & Miru)

### Objective
Transition all branding from "EterHub" (and its variants) to the finalized name "Heionhub", and officially name the internal finance application "Miru".

### Implementation Strategy

#### Global Find & Replace
A systematic find-and-replace operation will be executed across the codebase:
- **`EterHub`** -> **`Heionhub`**
- **`Eterhub`** -> **`Heionhub`**
- **`eterhub`** -> **`heionhub`** (e.g., in URLs, package names, lowercased references)

#### Finance App Branding
- Any references to the generic "finance app", "dashboard app", or "EterHub app" will be updated to **`Miru`**.
- This includes updating UI text, navigation labels, and relevant translation keys.

#### Critical Locations to Update
The following core files require explicit, manual verification to ensure accurate rebranding:
1.  **`src/payload/payload.config.ts`**: Update Payload CMS admin titles, meta titles, and localization configurations.
2.  **SEO Metadata in Root Layouts**: Update `title` and `description` tags in `src/app/[locale]/layout.tsx`, `src/app/[locale]/(frontend)/layout.tsx`, and `src/app/[locale]/(auth)/layout.tsx` (and any other metadata files like `page.tsx(s)` that generate metadata).
3.  **`package.json`**: Update the package `name` and any relevant scripts or descriptions.
4.  **Email Templates**: Update branding within `src/payload/collections/finance/Members/hooks/generateEmailHTML.ts` and `generateEmailSubject.ts` (or wherever these functions reside within the `Members` collection) to ensure onboarding emails reflect "Heionhub" or "Miru".
5.  **Globals**: Update `SiteSettings.ts`, `Header.ts`, and `Footer.ts` within `src/payload/globals/` to set the new branding defaults.

## 2. i18n Completion (Finance App - Miru)

### Objective
Eliminate all hardcoded English strings from the Miru (finance app) UI components and integrate them fully into the Next.js `next-intl` translation system to support Spanish (`es`) and English (`en`).

### Implementation Strategy

#### Context
A previous audit identified **17 files** containing approximately **150 hardcoded strings** within the `src/app/[locale]/app/` directory (e.g., `AccountActions.tsx`, `BudgetForm.tsx`, `TransactionFilter.tsx`, etc.).

#### Translation Namepaces
To keep translations organized, we will consolidate the new strings into existing namespaces or create dedicated ones within `src/messages/en.json` and `src/messages/es.json`.
-   **Proposed Strategy**: Create a new structural object/namespace named `"Miru"` or integrate deeply into the existing `"Dashboard"` namespace to house entities like `Accounts`, `Budgets`, `Categories`, `Transactions`, `ScheduledTransactions`, and `Import`.

#### Refactoring Process
For each of the identified files in the audit:
1.  Import `useTranslations` from `next-intl`.
2.  Initialize the hook: `const t = useTranslations('NamespaceSelected');`
3.  Replace all hardcoded JSX text (e.g., `<CardTitle>Add Transaction</CardTitle>`) with dynamic calls (e.g., `<CardTitle>{t('transactions.addTransaction')}</CardTitle>`).
4.  Ensure props that require strings (like `placeholder`, `title`, `description`) are also mapped to `t()`.
5.  Populate `en.json` and `es.json` concurrently to ensure parity.

## 3. Verification Plan

Upon completion of the rebrand and i18n refactor, the following quality assurance checks MUST be executed to validate the integrity of the application:

1.  **Type Safety Check**:
    Run `npx tsc --noEmit`
    -   *Expected Result*: Zero type errors, ensuring no interfaces or type definitions were broken during the find-and-replace.

2.  **Production Build Test**:
    Run `pnpm build`
    -   *Expected Result*: Successful compilation with **Exit Code 0**, validating that all Next.js static generation, Payload CMS configurations, and `next-intl` translations load correctly in a production environment.
