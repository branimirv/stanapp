import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { GlassSurface } from '@/components/ui/GlassSurface';
import { Spacing } from '@/constants/theme';

interface HeaderActionsPillProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

/** Glass pill grouping header action icons (settings, search, create, etc.). */
export function HeaderActionsPill({ children, style }: HeaderActionsPillProps) {
  if (!children) {
    return null;
  }

  return (
    <GlassSurface shape="pill" style={style} contentStyle={styles.pillOverlay}>
      <View style={styles.group}>{children}</View>
    </GlassSurface>
  );
}

const styles = StyleSheet.create({
  pillOverlay: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
  },
  group: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
