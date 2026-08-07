# Plan 05 — Tokens & routes

**Goal:** No hardcoded colors/routes/magic layout; finish Naslov + `routes` adoption.

**Status:** Done (core leftovers)

## Deliverables

- [x] `routes.*` already enforced from prior work
- [x] Tab layout / ErrorState / AlertBanner / propertyType off legacy `Colors`
- [x] Android tab bar rgba → `constants/tabBar.ts`
- [x] Sheet padding constant where extracted (`constants/sheet.ts`)
- [x] User-facing copy stays in i18n
- [ ] Full Material typography retirement — ongoing as StyleSheets migrate (non-blocking)

## Done when

- [x] Migrated critical call sites use theme tokens
- [x] No new `Colors.*` in tab chrome / error / alert banners
