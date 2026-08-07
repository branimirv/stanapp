import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HEADER_ACTION_SLOT, HEADER_EDGE_INSET } from '@/constants/header';

interface FloatingScreenActionsProps {
  children?: ReactNode;
  /** Screen edge to pin actions against. Defaults to right. */
  align?: 'left' | 'right';
}

/** Vertical space reserved under the status bar for floating actions (+ gap before titles). */
export const FLOATING_ACTIONS_ROW_HEIGHT = HEADER_ACTION_SLOT + 24;

/** Top padding so scroll content clears the floating action row. */
export function useFloatingActionsInset() {
  const insets = useSafeAreaInsets();
  return insets.top + FLOATING_ACTIONS_ROW_HEIGHT;
}

/**
 * Revolut-style floating chrome: actions sit over edge-to-edge content
 * with no native header bar behind them.
 */
export function FloatingScreenActions({
  children,
  align = 'right',
}: FloatingScreenActionsProps) {
  const insets = useSafeAreaInsets();

  if (!children) return null;

  return (
    <View
      pointerEvents="box-none"
      className="absolute z-20"
      style={{
        top: insets.top + 4,
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
