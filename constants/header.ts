import { Spacing } from '@/constants/theme';

/** Horizontal inset from screen edge — single source for header side padding. */
export const HEADER_EDGE_INSET = Spacing.md;

/** Fixed touch slot for each header action icon. */
export const HEADER_ACTION_SLOT = 40;

/** Lucide icon size inside header actions. */
export const HEADER_ICON_SIZE = 22;

export const headerLeftContainerStyle = {
  paddingLeft: HEADER_EDGE_INSET,
};

export const headerRightContainerStyle = {
  paddingRight: HEADER_EDGE_INSET,
  justifyContent: 'flex-end' as const,
  alignItems: 'center' as const,
};

/**
 * Tab root screens: keep `title` for a11y / screen name, hide the visual
 * header label (tab bar already orients the user). Header bar stays for actions.
 *
 * Use `headerTitle: ''` — not `() => null`. On iOS native-stack, a null custom
 * title falls back to the string `title` and stays visible (Android hides it).
 */
export function tabRootScreenOptions(title: string) {
  return {
    title,
    headerTitle: '',
  };
}
