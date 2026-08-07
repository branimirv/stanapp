# Plan 02 — Screen decomposition

**Goal:** Thin route screens; extract presentational pieces + screen hooks for unit-test readiness.

**Pattern:**

```
Screen (route)
  ├── useXxxScreenState()     // filters, sheets, derived lists
  ├── XxxHeader / sections    // presentational props
  └── XxxSheets               // controlled visible + callbacks
```

**Out of scope:** Shared FilterChipRow / header consolidation (plan 04), unless trivially in-path.

**Status:** Complete (2A–2D)

## Slices

### 2A — Me ✅

- `app/(tabs)/me/index.tsx` (~484 → **143**)
- `useMeScreen`, `MeProfileHeader`, `MeSettingsContent`, `MePreferenceSheets`, `splitDisplayName`

### 2B — Expenses ✅ (paired with [plan 03](./03-list-performance.md))

- `app/(tabs)/expenses/index.tsx` (~565 → **153**)
- `useExpensesScreen`, list header/bays/rows/empty, `utils/expenseList.ts`
- FlatList + `listPerformanceProps`

### 2C — Property detail ✅

- `app/property/[id].tsx` (~600 → **219**)
- `usePropertyDetailScreen`, tabs own Query hooks, `StatementSheet` self-fetches when visible

### 2D — Tenant detail & Reports ✅

- `app/tenant/[id].tsx` (~496 → **110**)
  - `useTenantDetailScreen`, `TenantDetailHeader` / `Footer` / `ContractRow` / `QuickAction`
  - `utils/tenant.ts` (`getContractStatus`) + tests; full payments FlatList (no preview)
- `app/(tabs)/reports/index.tsx` (~432 → **91**)
  - `useReportsScreen`, `ReportScreenHeader` / `ReportSummaryBays` / `ReportBody`
  - `utils/reportPeriodLabel.ts` + tests

## Done when

- [x] Migrated screens mostly &lt;250 lines
- [x] Presentational extracts are props-only (no stores/router when avoidable)
- [x] Extracted utils have unit tests
