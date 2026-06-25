import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from 'react-native-paper';
import { Colors, Spacing } from '@/constants/theme';

export interface AppCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}

export function AppCard({ children, style, onPress }: AppCardProps) {
  const theme = useTheme();

  const content = (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.dark ? Colors.surfaceDark : Colors.surface,
          borderColor: theme.dark ? Colors.borderDark : Colors.border,
        },
        style,
      ]}
    >
      {children}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} accessibilityRole="button">
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: Spacing.md,
  },
});
