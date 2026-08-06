import { Children, type ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';

interface HeaderActionsPillProps {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * Row of Naslov `btn-ico` circles (docs, edit, etc.).
 * Children should be icon presses (e.g. HeaderIconButton) — this wraps each in surface2.
 */
export function HeaderActionsPill({ children, style }: HeaderActionsPillProps) {
  const { theme } = useAppTheme();
  const { colors } = theme;
  const actions = Children.toArray(children).filter(Boolean);
  if (actions.length === 0) {
    return null;
  }

  return (
    <View style={[styles.row, style]}>
      {actions.map((child, index) => (
        <View
          key={index}
          style={[styles.btnIco, { backgroundColor: colors.surface2 }]}
        >
          {child}
        </View>
      ))}
    </View>
  );
}

/** Standalone Naslov btn-ico for one-off header actions. */
export function HeaderBtnIco({
  children,
  onPress,
  accessibilityLabel,
  style,
}: {
  children: ReactNode;
  onPress: () => void;
  accessibilityLabel: string;
  style?: StyleProp<ViewStyle>;
}) {
  const { theme } = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={[styles.btnIco, { backgroundColor: theme.colors.surface2 }, style]}
      hitSlop={4}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  btnIco: {
    width: 38,
    height: 38,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
