import type { LucideIcon } from 'lucide-react-native';
import { Pressable, type StyleProp, type ViewStyle } from 'react-native';

import { HEADER_ACTION_SLOT, HEADER_ICON_SIZE } from '@/constants/header';
import { useAppTheme } from '@/hooks/useAppTheme';

interface HeaderIconButtonProps {
  icon: LucideIcon;
  onPress: () => void;
  accessibilityLabel: string;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

/** Icon press for Naslov `btn-ico` circles (wrap with StackHeaderActions / HeaderActionsPill glass). */
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
      className="items-center justify-center"
      style={[{ width: HEADER_ACTION_SLOT, height: HEADER_ACTION_SLOT }, style]}
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
