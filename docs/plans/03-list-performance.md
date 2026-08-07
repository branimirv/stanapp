# Plan 03 — List performance

**Goal:** Virtualize heavy lists; apply shared list perf props; memoize rows only where it pays off.

**Status:** Done (core). Optional chart isolation / expo-image remain polish.

## Deliverables

- [x] Expenses tab + PropertyExpensesTab → FlatList + `listPerformanceProps`
- [x] Stable `keyExtractor` + memoized `renderItem`
- [x] `ExpenseListRow` stays `React.memo`
- [ ] Isolate report charts (optional follow-up)
- [ ] Broader `expo-image` adoption (optional follow-up)

## Done when

- [x] Troškovi and property expenses virtualized
