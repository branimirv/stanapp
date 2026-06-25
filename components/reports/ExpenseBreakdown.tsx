import { useMemo } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { CategoryBadge } from '@/components/expense/CategoryBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { formatCurrency } from '@/utils/formatters';
import type { CategoryBreakdown, Language } from '@/types/app.types';

export interface ExpenseBreakdownProps {
  data: CategoryBreakdown[];
  currency?: string;
  language?: Language;
  style?: StyleProp<ViewStyle>;
}

export function ExpenseBreakdown({
  data,
  currency = 'EUR',
  language = 'hr',
  style,
}: ExpenseBreakdownProps) {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const resolvedLanguage = language ?? (i18n.language === 'en' ? 'en' : 'hr');

  const pieData = useMemo(
    () =>
      data.map((item) => ({
        value: item.amount,
        color: item.color,
        text: `${Math.round(item.percentage)}%`,
      })),
    [data],
  );

  const total = data.reduce((sum, item) => sum + item.amount, 0);

  if (data.length === 0 || total <= 0) {
    return (
      <EmptyState
        title={t('reports.noData')}
        subtitle={t('reports.noDataHint')}
        style={styles.empty}
      />
    );
  }

  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.title, { color: theme.colors.onSurface }]}>
        {t('reports.expenseBreakdown')}
      </Text>

      <View style={styles.chartWrap}>
        <PieChart
          data={pieData}
          donut
          radius={100}
          innerRadius={62}
          innerCircleColor={theme.dark ? Colors.surfaceDark : Colors.surface}
          centerLabelComponent={() => (
            <View style={styles.centerLabel}>
              <Text style={[styles.centerTitle, { color: theme.colors.onSurfaceVariant }]}>
                {t('common.total')}
              </Text>
              <Text style={[styles.centerValue, { color: theme.colors.onSurface }]}>
                {formatCurrency(total, currency, resolvedLanguage)}
              </Text>
            </View>
          )}
          showText
          textColor={Colors.textInverse}
          textSize={11}
          focusOnPress
          isAnimated
        />
      </View>

      <View style={styles.list}>
        {data.map((item) => (
          <View
            key={item.categoryId}
            style={[
              styles.listRow,
              { borderBottomColor: theme.colors.outline },
            ]}
          >
            <CategoryBadge
              categoryKey={item.categoryKey}
              icon={item.icon}
              color={item.color}
            />
            <View style={styles.listMeta}>
              <Text style={[styles.amount, { color: theme.colors.onSurface }]}>
                {formatCurrency(item.amount, currency, resolvedLanguage)}
              </Text>
              <Text style={[styles.share, { color: theme.colors.onSurfaceVariant }]}>
                {t('reports.categoryShare')}: {item.percentage.toFixed(1)}%
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
  },
  title: {
    ...Typography.titleMedium,
  },
  chartWrap: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  centerLabel: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  centerTitle: {
    ...Typography.labelMedium,
  },
  centerValue: {
    ...Typography.titleMedium,
    textAlign: 'center',
  },
  list: {
    gap: Spacing.sm,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    paddingBottom: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  listMeta: {
    alignItems: 'flex-end',
    gap: 2,
  },
  amount: {
    ...Typography.titleMedium,
  },
  share: {
    ...Typography.bodySmall,
  },
  empty: {
    paddingVertical: Spacing.lg,
  },
});
