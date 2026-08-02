import { Children, type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { GlassSurface } from '@/components/ui/GlassSurface';
import { HEADER_ACTION_SLOT } from '@/constants/header';
import { Spacing } from '@/constants/theme';

interface HeaderActionsPillProps {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

/** Row of separate circular glass header actions (create, search, edit, etc.). */
export function HeaderActionsPill({ children, style }: HeaderActionsPillProps) {
  const actions = Children.toArray(children).filter(Boolean);
  if (actions.length === 0) {
    return null;
  }

  return (
    <View style={[styles.row, style]}>
      {actions.map((child, index) => (
        <GlassSurface
          key={index}
          shape="circle"
          interactive
          style={styles.circle}
          contentStyle={styles.circleOverlay}
        >
          {child}
        </GlassSurface>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  circle: {
    width: HEADER_ACTION_SLOT,
    height: HEADER_ACTION_SLOT,
  },
  circleOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
