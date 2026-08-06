import type { LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { HEADER_ACTION_SLOT, HEADER_ICON_SIZE } from '@/constants/header';
import { useAppTheme } from '@/hooks/useAppTheme';

interface HeaderIconButtonProps {
  icon: LucideIcon;
  onPress: () => void;
  accessibilityLabel: string;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

/** Icon press for Naslov `btn-ico` circles (wrap with StackHeaderActions / HeaderActionsPill). */
export function HeaderIconButton({
  icon: IconComponent,
  onPress,
  accessibilityLabel,
  color,
  style,
}: HeaderIconButtonProps) {
  const { theme } = useAppTheme();
  const iconColor = color ?? theme.colors.fg;

  return (
    <Pressable
      onPress={onPress}
      style={StyleSheet.flatten([styles.slot, style])}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={4}
    >
      {({ pressed }) => (
        <IconComponent
          size={HEADER_ICON_SIZE}
          color={iconColor}
          strokeWidth={2}
          opacity={pressed ? 0.5 : 1}
        />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  slot: {
    width: HEADER_ACTION_SLOT,
    height: HEADER_ACTION_SLOT,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
