import { Children, type ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { GlassSurface } from '@/components/ui/GlassSurface';
import { HEADER_ACTION_SLOT } from '@/constants/header';
import { Spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';

interface HeaderActionsPillProps {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * Row of Naslov `btn-ico` circles (docs, edit, etc.).
 * Children should be icon presses (e.g. HeaderIconButton) — each sits on liquid glass.
 */
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
          style={styles.btnIco}
          contentStyle={styles.btnIcoContent}
        >
          {child}
        </GlassSurface>
      ))}
    </View>
  );
}

/** Standalone Naslov btn-ico for one-off header / floating nav actions. */
export function HeaderBtnIco({
  children,
  onPress,
  accessibilityLabel,
  style,
  active = false,
  disabled = false,
}: {
  children: ReactNode;
  onPress: () => void;
  accessibilityLabel: string;
  style?: StyleProp<ViewStyle>;
  /** Filter / search “on” state — primary tint over glass. */
  active?: boolean;
  disabled?: boolean;
}) {
  const { theme } = useAppTheme();

  return (
    <GlassSurface
      shape="circle"
      interactive={!disabled}
      style={[styles.btnIco, disabled ? styles.disabled : null, style]}
      contentStyle={[
        styles.btnIcoContent,
        active ? { backgroundColor: theme.colors.primaryTint } : null,
      ]}
    >
      <Pressable
        onPress={onPress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ selected: active, disabled }}
        style={styles.pressable}
        hitSlop={4}
      >
        {children}
      </Pressable>
    </GlassSurface>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  btnIco: {
    width: HEADER_ACTION_SLOT,
    height: HEADER_ACTION_SLOT,
  },
  btnIcoContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressable: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.45,
  },
});
