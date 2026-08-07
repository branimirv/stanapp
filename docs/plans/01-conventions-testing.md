# Plan 01 — Conventions & testing

**Goal:** Agree layer rules and land a minimal test runner so later extracts are testable.

**Out of scope:** Screen refactors, FlatList, theme sweeps.

**Status:** Done

## Deliverables

- [x] Conventions documented (`docs/plans/` + `.cursor/rules/architecture-and-testing.mdc`)
- [x] Test runner: Jest + `jest-expo` + `@testing-library/react-native` (RNTL ready; utils first)
- [x] `@/` path alias works in tests (`jest.config.js` → `moduleNameMapper`)
- [x] First util tests: `formatters`, `validators`, `expense`, `dateRange`, `currency`
- [x] `pnpm test` / `pnpm test:watch` scripts in `package.json`

## Done when

- [x] Local `pnpm test` passes on utils (33 tests)
- [x] New PRs can add colocated `__tests__` without re-deciding tooling

## Notes

- No full-screen integration tests yet
- Prefer testing pure `utils/` before RNTL component tests
- Run: `pnpm test` or `pnpm exec jest --ci`
