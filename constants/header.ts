import { Spacing } from '@/constants/theme';

/** Extra vertical room in the header bar (content area below status bar). */
export const HEADER_BAR_HEIGHT = 52;

/** Horizontal inset from screen edge — mirrors native header left padding. */
export const HEADER_EDGE_INSET = Spacing.md;

export const headerRightContainerStyle = {
  justifyContent: 'flex-end' as const,
  alignItems: 'center' as const,
};

export const headerBarStyle = {
  minHeight: HEADER_BAR_HEIGHT,
};
