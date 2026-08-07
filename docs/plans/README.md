# Optimization plans (index)

Execute **one plan at a time**. Each is scoped for 1–2 PRs. Shared rules live here; details live in the linked docs.

## Shared rules (all plans)

1. **Screen = composition** — routes wire hooks/navigation; UI is presentational.
2. **Extract for testability** — props-in / UI-out; pure utils first.
3. **Memoize only where measured** — not blanket `useMemo`/`useCallback`.
4. **Finish existing systems** — theme tokens, `lib/routes.ts`, `listPerformanceProps`.
5. **No root rewrite** — keep flat Expo layout (`app/` at repo root). Do not invent `src/` / `core/` / `data/`.

### Layers

| Layer | Owns |
|-------|------|
| `app/` | Thin route shells |
| `components/<feature>/` | Feature UI |
| `components/ui/` | Primitives (no feature hooks / services) |
| `hooks/` | React Query + screen orchestration |
| `services/` | Async I/O only |
| `utils/` | Pure sync helpers (unit-test first) |
| `constants/` | Tokens, static config |
| `lib/` | Infrastructure (supabase, query, routes, auth) |
| `stores/` | Auth, theme, toast, tab chrome |

**Size targets:** presentational &lt;150–200 lines · screens &lt;250 after extract.

---

## Execution order

| # | Plan | Status |
|---|------|--------|
| 1 | [Conventions & testing](./01-conventions-testing.md) | ✅ |
| 2 | [Screen decomposition](./02-screen-decomposition.md) | ✅ |
| 3 | [List performance](./03-list-performance.md) | ✅ |
| 4 | [UI composition](./04-ui-composition.md) | ✅ |
| 5 | [Tokens & routes](./05-tokens-routes.md) | ✅ |
| 6 | [State & data layer](./06-state-data-layer.md) | ✅ |
| 7 | [Root hygiene](./07-root-hygiene.md) | ✅ |
| 8 | [Architecture extras](./08-architecture-extras.md) | ✅ |

All plans complete. Optional polish leftovers (chart memo isolation, broader expo-image, Material typography retirement) are noted inside individual plan docs.

← [Project structure](../project-structure.md)
