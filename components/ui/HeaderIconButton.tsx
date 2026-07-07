import type { LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from 'react-native-paper';

import { HEADER_ACTION_SLOT, HEADER_ICON_SIZE } from '@/constants/header';

interface HeaderIconButtonProps {
  icon: LucideIcon;
  onPress: () => void;
  accessibilityLabel: string;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export function HeaderIconButton({
  icon: Icon,
  onPress,
  accessibilityLabel,
  color,
  style,
}: HeaderIconButtonProps) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={StyleSheet.flatten([styles.slot, style])}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      {({ pressed }) => (
        <Icon
          size={HEADER_ICON_SIZE}
          color={color ?? theme.colors.onSurface}
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
