import type { LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from 'react-native-paper';

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
      style={StyleSheet.flatten([styles.button, style])}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
    >
      {({ pressed }) => (
        <Icon
          size={22}
          color={color ?? theme.colors.onSurface}
          strokeWidth={2}
          opacity={pressed ? 0.5 : 1}
        />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 4,
  },
});
