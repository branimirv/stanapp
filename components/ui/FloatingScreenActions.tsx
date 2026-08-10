import type { ReactNode } from 'react';
import { Platform, View } from 'react-native';

import { HEADER_ACTION_SLOT, HEADER_EDGE_INSET } from '@/constants/header';
import { useScreenTopInset } from '@/hooks/useScreenTopInset';

interface FloatingScreenActionsProps {
  children?: ReactNode;
  /** Screen edge to pin actions against. Defaults to right. */
  align?: 'left' | 'right';
}

/** Vertical space reserved under the status bar for floating actions (+ gap before titles). */
export const FLOATING_ACTIONS_ROW_HEIGHT = HEADER_ACTION_SLOT + 24;

/**
 * Top padding so scroll content clears the floating action row.
 * iOS tab ScrollViews already apply the status-bar inset via
 * `contentInsetAdjustmentBehavior="automatic"` — only reserve the action row.
 * Android needs the status-bar height included explicitly.
 */
export function useFloatingActionsInset() {
  const topInset = useScreenTopInset();
  if (Platform.OS === 'ios') {
    return FLOATING_ACTIONS_ROW_HEIGHT;
  }
  return topInset + FLOATING_ACTIONS_ROW_HEIGHT;
}

/**
 * Revolut-style floating chrome: actions sit over edge-to-edge content
 * with no native header bar behind them.
 */
export function FloatingScreenActions({
  children,
  align = 'right',
}: FloatingScreenActionsProps) {
  const topInset = useScreenTopInset();

  if (!children) return null;

  return (
    <View
      pointerEvents="box-none"
      className="absolute z-20"
      style={{
        top: topInset + 4,
        elevation: 20,
        ...(align === 'left'
          ? { left: HEADER_EDGE_INSET }
          : { right: HEADER_EDGE_INSET }),
      }}
    >
      {children}
    </View>
  );
}
