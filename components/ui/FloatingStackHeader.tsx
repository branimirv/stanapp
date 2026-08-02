import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HeaderBackButton } from '@/components/ui/HeaderBackButton';
import { Text } from '@/components/ui/text';
import { HEADER_ACTION_SLOT, HEADER_EDGE_INSET } from '@/constants/header';

interface FloatingStackHeaderProps {
  title?: string;
  /**
   * Hide the nav title when the screen shows a full-width page title below
   * (e.g. property detail with long names).
   */
  hideTitle?: boolean;
  right?: ReactNode;
}

/** Side slot width so a centered title stays balanced with back / up to 3 actions. */
const SIDE_SLOT = HEADER_ACTION_SLOT * 3 + 8;

/** Vertical space under the status bar for the floating stack chrome. */
export const FLOATING_STACK_HEADER_HEIGHT = HEADER_ACTION_SLOT + 8;

export function useFloatingStackHeaderInset() {
  const insets = useSafeAreaInsets();
  return insets.top + FLOATING_STACK_HEADER_HEIGHT;
}

/**
 * Revolut-style stack chrome: back + title (+ optional actions) float over
 * edge-to-edge content with no native header bar.
 */
export function FloatingStackHeader({
  title,
  hideTitle = false,
  right,
}: FloatingStackHeaderProps) {
  const insets = useSafeAreaInsets();
  const showTitle = Boolean(title) && !hideTitle;

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.container,
        {
          paddingTop: insets.top + 4,
          paddingHorizontal: HEADER_EDGE_INSET,
        },
      ]}
      accessibilityLabel={title || undefined}
    >
      {showTitle ? (
        <View style={styles.row}>
          <View style={styles.sideSlot}>
            <HeaderBackButton />
          </View>
          <Text
            className="text-foreground flex-1 text-center text-lg font-semibold"
            numberOfLines={1}
          >
            {title}
          </Text>
          <View style={[styles.sideSlot, styles.sideSlotEnd]}>{right}</View>
        </View>
      ) : (
        <View style={styles.row}>
          <HeaderBackButton />
          <View style={styles.spacer} />
          {right}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    elevation: 20,
  },
  row: {
    minHeight: HEADER_ACTION_SLOT,
    flexDirection: 'row',
    alignItems: 'center',
  },
  spacer: {
    flex: 1,
  },
  sideSlot: {
    width: SIDE_SLOT,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  sideSlotEnd: {
    alignItems: 'flex-end',
  },
});
