# Plan 08 — Architecture extras

**Goal:** Targeted architecture cleanups — not a rewrite.

**Status:** Done

## Deliverables

- [x] Split reports: `services/reports.ts` fetch-only; `utils/reportPeriod.ts` + `utils/reportAggregates.ts` pure
- [x] UI imports period helpers from utils (not services)
- [x] Thin `app/_layout.tsx` via `useAuthDeepLinkSubscription` + `useAuthSessionGate` + `BootError`
- [x] Unit tests for report period helpers

## Done when

- [x] Reports period/aggregate logic unit-testable without Supabase
- [x] Root layout is mostly composition
- [x] Layer leaks (UI → services for pure period logic) removed
