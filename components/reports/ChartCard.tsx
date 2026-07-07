import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from 'react-native-paper';
import { AppCard } from '@/components/ui/AppCard';
import { Colors, Spacing } from '@/constants/theme';

export interface ChartCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function ChartCard({ children, style }: ChartCardProps) {
  const theme = useTheme();

  return (
    <AppCard
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
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: Spacing.md,
    gap: Spacing.md,
  },
});
