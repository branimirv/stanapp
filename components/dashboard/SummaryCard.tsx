import type { LucideIcon } from 'lucide-react-native';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { Colors, Spacing, Typography } from '@/constants/theme';

export interface SummaryCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  accentColor?: string;
  style?: StyleProp<ViewStyle>;
}

export function SummaryCard({
  title,
  value,
  icon: Icon,
  accentColor = Colors.primary,
  style,
}: SummaryCardProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.dark ? Colors.surfaceDark : Colors.surface,
          borderColor: theme.colors.outline,
        },
        style,
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: `${accentColor}22` }]}>
        <Icon size={22} color={accentColor} strokeWidth={2} />
      </View>
      <Text style={[styles.title, { color: theme.colors.onSurfaceVariant }]} numberOfLines={1}>
        {title}
      </Text>
      <Text style={[styles.value, { color: theme.colors.onSurface }]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 100,
    borderRadius: 12,
    borderWidth: 1,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...Typography.labelMedium,
  },
  value: {
    ...Typography.titleLarge,
  },
});
