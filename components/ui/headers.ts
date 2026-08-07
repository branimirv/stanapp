/**
 * Header chrome compositions — prefer these over ad-hoc header buttons.
 *
 * **Tab roots** (`/(tabs)/*`):
 * - `SearchableTabActions` / `TabHeaderActions` — search + create in floating actions
 * - `FloatingScreenActions` — Me / reports filter chips host
 *
 * **Stack screens** (property / tenant / expense / rent):
 * - `StackHeaderActions` + `HeaderIconButton` — edit / statement / etc.
 * - `HeaderBackButton` — explicit back when needed
 * - `FloatingStackHeader` — edge-to-edge detail chrome inset
 *
 * Low-level pieces (`HeaderAction`, `HeaderActionsPill`) stay internal building blocks.
 */

export { HeaderBackButton } from '@/components/ui/HeaderBackButton';
export { HeaderIconButton } from '@/components/ui/HeaderIconButton';
export { StackHeaderActions } from '@/components/ui/StackHeaderActions';
export { TabHeaderActions } from '@/components/ui/TabHeaderActions';
export { FloatingScreenActions } from '@/components/ui/FloatingScreenActions';
