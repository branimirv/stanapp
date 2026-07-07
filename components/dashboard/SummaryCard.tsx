import type { LucideIcon } from 'lucide-react-native';
import { Minus, TrendingDown, TrendingUp } from 'lucide-react-native';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { Colors, Spacing, Typography } from '@/constants/theme';

export interface SummaryCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  accentColor?: string;
  delta?: number | null;
  invertDelta?: boolean;
  hero?: boolean;
  style?: StyleProp<ViewStyle>;
}

function formatDelta(delta: number): string {
  const rounded = Math.abs(delta).toFixed(0);
  return `${delta >= 0 ? '+' : '-'}${rounded}%`;
}

function DeltaBadge({
  delta,
  invertDelta,
}: {
  delta: number | null | undefined;
  invertDelta?: boolean;
}) {
  const { t } = useTranslation();
  const theme = useTheme();

  if (delta === null || delta === undefined) {
    return (
      <View style={styles.deltaRow}>
        <Minus size={12} color={theme.colors.onSurfaceVariant} strokeWidth={2} />
        <Text style={[styles.deltaText, { color: theme.colors.onSurfaceVariant }]}>
          {t('dashboard.noComparison')}
        </Text>
      </View>
    );
  }

  const isPositive = invertDelta ? delta < 0 : delta > 0;
  const isNeutral = delta === 0;
  const color = isNeutral
    ? theme.colors.onSurfaceVariant
    : isPositive
      ? Colors.accent
      : Colors.danger;
  const Icon = isNeutral ? Minus : delta > 0 ? TrendingUp : TrendingDown;

  return (
    <View style={styles.deltaRow}>
      <Icon size={12} color={color} strokeWidth={2} />
      <Text style={[styles.deltaText, { color }]}>
        {formatDelta(delta)} {t('dashboard.vsLastMonth')}
      </Text>
    </View>
  );
}

export function SummaryCard({
  title,
  value,
  icon: Icon,
  accentColor = Colors.primary,
  delta,
  invertDelta,
  hero = false,
  style,
}: SummaryCardProps) {
  const theme = useTheme();

  if (hero) {
    return (
      <View
        style={[
          styles.heroCard,
          {
            backgroundColor: theme.dark ? Colors.surfaceDark : Colors.surface,
            borderColor: theme.colors.outline,
          },
          style,
        ]}
      >
        <View style={styles.heroHeader}>
          <View style={[styles.iconWrap, { backgroundColor: `${accentColor}22` }]}>
            <Icon size={24} color={accentColor} strokeWidth={2} />
          </View>
          <Text style={[styles.heroTitle, { color: theme.colors.onSurfaceVariant }]}>
            {title}
          </Text>
        </View>
        <Text style={[styles.heroValue, { color: theme.colors.onSurface }]} numberOfLines={1}>
          {value}
        </Text>
        <DeltaBadge delta={delta} invertDelta={invertDelta} />
      </View>
    );
  }

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
      {delta !== undefined ? <DeltaBadge delta={delta} invertDelta={invertDelta} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 100,
    borderRadius: 16,
    borderWidth: 1,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  heroCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: Spacing.lg,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  heroTitle: {
    ...Typography.titleMedium,
  },
  heroValue: {
    ...Typography.displayMedium,
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
  deltaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  deltaText: {
    ...Typography.labelSmall,
  },
});
