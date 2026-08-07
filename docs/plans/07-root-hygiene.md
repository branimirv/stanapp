# Plan 07 — Root hygiene

**Goal:** Clean the repo root mentally and on disk — without restructuring app code.

**Out of scope:** Moving `app/` / `components/` / `hooks` under `src/` or `core/`.

## Do not

- Nest data layers under `core/` / `data/` / `features/` at root
- Treat `tmp/`, `prompts/`, or scratch PNGs as architecture

## Deliverables

- [x] Clear local `tmp/` scratch PNGs; keep gitignored
- [x] Convention: durable captures → `screenshots/`; throwaway → `tmp/` only (noted in `.gitignore`)
- [x] `prompts/`: remains gitignored / out of app-structure docs
- [x] Commit thin shared docs: `docs/plans/**`, `project-structure.md`, `optimization-plan.md` (via `.gitignore` allowlist)
- [x] Enforce `lib` vs `utils` vs `constants` in review — no mass file moves

## Done when

- [x] Sidebar/root isn’t treated as needing a folder reshuffle
- [x] Scratch vs durable media is obvious
- [x] Structure docs match reality ([project-structure.md](../project-structure.md))
