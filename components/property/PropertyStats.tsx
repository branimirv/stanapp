import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { formatCurrency } from '@/utils/formatters';
import type { Language } from '@/types/app.types';

export interface PropertyStatsProps {
  totalIncome: number;
  totalExpenses: number;
  currency?: string;
  language?: Language;
}

export function PropertyStats({
  totalIncome,
  totalExpenses,
  currency = 'EUR',
  language = 'hr',
}: PropertyStatsProps) {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const resolvedLanguage = language ?? (i18n.language === 'en' ? 'en' : 'hr');
  const net = totalIncome - totalExpenses;

  const stats = [
    {
      key: 'income',
      label: t('properties.statsIncome'),
      value: formatCurrency(totalIncome, currency, resolvedLanguage),
      color: Colors.accent,
    },
    {
      key: 'expenses',
      label: t('properties.statsExpenses'),
      value: formatCurrency(totalExpenses, currency, resolvedLanguage),
      color: Colors.danger,
    },
    {
      key: 'net',
      label: t('properties.statsNet'),
      value: formatCurrency(net, currency, resolvedLanguage),
      color: net >= 0 ? Colors.accent : Colors.danger,
    },
  ] as const;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.dark ? Colors.surfaceDark : Colors.surface,
          borderColor: theme.colors.outline,
        },
      ]}
    >
      {stats.map((stat, index) => (
        <View
          key={stat.key}
          style={[
            styles.stat,
            index < stats.length - 1 && [
              styles.statDivider,
              { borderRightColor: theme.colors.outline },
            ],
          ]}
        >
          <Text style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>
            {stat.label}
          </Text>
          <Text style={[styles.value, { color: stat.color }]} numberOfLines={1}>
            {stat.value}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  statDivider: {
    borderRightWidth: 1,
  },
  label: {
    ...Typography.labelMedium,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  value: {
    ...Typography.titleMedium,
    textAlign: 'center',
  },
});
