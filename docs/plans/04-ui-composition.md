# Plan 04 — UI composition

**Goal:** Kill duplication; shared chrome for filters/headers/forms; presentational navigation via callbacks.

**Out of scope:** Naslov token hex migration (plan 05), FlatList (plan 03).

**Status:** Done

## Deliverables

- [x] Shared selectable chips: `FilterOptionChipRow` (expense/report filter sheets)
- [x] Shared `FilterGroup` + `AppFilterSheetFooter` chrome
- [x] Header compositions documented/re-exported in `components/ui/headers.ts`
- [x] Shared `FormField` shell (+ used on TenantForm)
- [x] `AppButton` prefers `variant`; call sites migrated off Paper `mode`
- [x] Applied-filter chips remain `FilterChipRow` (different component — clear chips)

## Done when

- [x] One option-chip implementation for filter sheets
- [x] Feature sheets compose shared chrome
- [x] Header API documented in tab vs stack compositions
