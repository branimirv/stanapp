import { ChevronRight, Home } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { formatCurrency } from '@/utils/formatters';
import type { Language } from '@/types/app.types';

export interface RentCollectionCardProps {
  collected: number;
  expected: number;
  currency: string;
  language?: Language;
  onPress?: () => void;
}

export function RentCollectionCard({
  collected,
  expected,
  currency,
  language = 'hr',
  onPress,
}: RentCollectionCardProps) {
  const theme = useTheme();
  const { t } = useTranslation();

  const progress = expected > 0 ? Math.min(collected / expected, 1) : 0;
  const progressPct = Math.round(progress * 100);

  const content = (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.dark ? Colors.surfaceDark : Colors.surface,
          borderColor: theme.colors.outline,
        },
      ]}
    >
      <View style={styles.header}>
        <View style={[styles.iconWrap, { backgroundColor: `${Colors.accent}22` }]}>
          <Home size={20} color={Colors.accent} strokeWidth={2} />
        </View>
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: theme.colors.onSurface }]}>
            {t('dashboard.rentCollected')}
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
            {t('dashboard.rentCollectionProgress', { percent: progressPct })}
          </Text>
        </View>
        {onPress ? (
          <ChevronRight size={20} color={theme.colors.onSurfaceVariant} strokeWidth={2} />
        ) : null}
      </View>

      <View style={[styles.track, { backgroundColor: theme.dark ? Colors.surfaceVariantDark : Colors.surfaceVariant }]}>
        <View
          style={[
            styles.fill,
            {
              width: `${progressPct}%`,
              backgroundColor: progressPct >= 100 ? Colors.accent : Colors.primary,
            },
          ]}
        />
      </View>

      <View style={styles.amounts}>
        <Text style={[styles.amount, { color: theme.colors.onSurface }]}>
          {formatCurrency(collected, currency, language)}
        </Text>
        <Text style={[styles.expected, { color: theme.colors.onSurfaceVariant }]}>
          / {formatCurrency(expected, currency, language)}
        </Text>
      </View>
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
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...Typography.titleMedium,
  },
  subtitle: {
    ...Typography.bodySmall,
  },
  track: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
  amounts: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  amount: {
    ...Typography.titleLarge,
  },
  expected: {
    ...Typography.bodyMedium,
  },
});
