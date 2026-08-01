import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { AppCard } from '@/components/ui/AppCard';
import { Colors, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';

export interface ChartCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function ChartCard({ children, style }: ChartCardProps) {
  const { isDark } = useAppTheme();

  return (
    <AppCard
      style={[
        styles.card,
        {
          backgroundColor: isDark ? Colors.surfaceDark : Colors.surface,
          borderColor: isDark ? Colors.borderDark : Colors.border,
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
