# Navigation chrome screenshot audit

Reference captures from before alignment live in `before/`. After implementing `GlassSurface` + `useAppHeaderOptions`, capture matching frames into `after/light` and `after/dark`.

## Inventory

| Group | Route | Notes |
|--------|--------|--------|
| Tab roots | `/(tabs)/index` | Dashboard — settings glass pill |
| | `/(tabs)/properties` | + / search / settings glass pill |
| | `/(tabs)/expenses` | + / search / settings glass pill |
| | `/(tabs)/reports` | settings glass pill |
| Entity push | `/property/[id]` | glass back circle + action pill + property sub-tabs |
| | `/tenant/[id]`, `/expense/[id]`, `/rent/[id]` | stack header pattern |
| | `*/new`, `*/edit/[id]` | form screens |
| Property sub-tabs | same `[id]` | overview / tenants / expenses / rent (4 states) |
| Settings | `/settings`, profile, notifications | stack, no default settings in header |
| Auth | login, register, forgot-password | login has no header |

## Side-by-side comparison (what to diff)

| Column | Before (reference) | After (target) |
|--------|-------------------|----------------|
| **Tab roots** | Flat header; actions **not** in glass pill (`before/tab-root-properties-misaligned.png`) | Same icons in **glass pill** as entity detail |
| **Entity push** | Glass back + glass action pill (`before/entity-push-property-detail.png`) | Same pattern via shared `GlassSurface` + `HeaderActionsPill` |
| **Property sub-tabs** | Underline tab bar below header | Unchanged layout; icons aligned to 20px |

## Capture workflow

1. Run `pnpm ios` and sign in.
2. Set appearance (Settings → theme) for light or dark.
3. Navigate to the screen, then:

```bash
./scripts/capture-screenshot.sh screenshots/after/dark/tabs-properties.png
```

4. Deep links (logged-in session):

```bash
xcrun simctl openurl booted "stanapp://properties"
xcrun simctl openurl booted "stanapp://property/<id>"
```

5. Repeat for light mode into `after/light/`.

## Implementation map

- `constants/glass.ts` — shared blur/overlay tokens
- `components/ui/GlassSurface.tsx` — blur + gloss surface
- `hooks/useAppHeaderOptions.tsx` — unified native header factory
- `HeaderActionsPill` / `HeaderBackButton` — glass chrome for actions and back
- `GlassTabBar` — uses `GlassSurface` internally
