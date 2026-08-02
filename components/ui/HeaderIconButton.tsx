import type { LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { HEADER_ACTION_SLOT, HEADER_ICON_SIZE } from '@/constants/header';
import { useAppTheme } from '@/hooks/useAppTheme';

interface HeaderIconButtonProps {
  icon: LucideIcon;
  onPress: () => void;
  accessibilityLabel: string;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export function HeaderIconButton({
  icon: IconComponent,
  onPress,
  accessibilityLabel,
  color,
  style,
}: HeaderIconButtonProps) {
  const { theme } = useAppTheme();
  const iconColor = color ?? theme.colors.onSurface;

  return (
    <Pressable
      onPress={onPress}
      style={StyleSheet.flatten([styles.slot, style])}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      {({ pressed }) => (
        <Icon
          as={IconComponent}
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
