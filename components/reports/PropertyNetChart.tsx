import { useMemo } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { ChartCard } from '@/components/reports/ChartCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { formatCurrency } from '@/utils/formatters';
import type { Language, PropertyReportSummary } from '@/types/app.types';

export interface PropertyNetChartProps {
  data: PropertyReportSummary[];
  language?: Language;
  style?: StyleProp<ViewStyle>;
}

export function PropertyNetChart({ data, language = 'hr', style }: PropertyNetChartProps) {
  const theme = useTheme();
  const { t } = useTranslation();

  const chartItems = useMemo(
    () => data.filter((item) => item.net !== 0 || item.totalRentCollected > 0 || item.totalExpensesPaid > 0),
    [data],
  );

  const maxAbsNet = useMemo(
    () => Math.max(...chartItems.map((item) => Math.abs(item.net)), 1),
    [chartItems],
  );

  if (chartItems.length === 0) {
    return (
      <EmptyState
        title={t('reports.noData')}
        subtitle={t('reports.noDataHint')}
        style={styles.empty}
      />
    );
  }

  return (
    <ChartCard style={style}>
      <Text style={[styles.title, { color: theme.colors.onSurface }]}>
        {t('reports.propertyNet')}
      </Text>

      <View style={styles.list}>
        {chartItems.map((item) => {
          const barWidth = Math.max((Math.abs(item.net) / maxAbsNet) * 100, item.net !== 0 ? 4 : 0);
          const barColor = item.net >= 0 ? Colors.accent : Colors.danger;

          return (
            <View key={item.propertyId} style={styles.row}>
              <View style={styles.rowHeader}>
                <Text
                  style={[styles.propertyName, { color: theme.colors.onSurface }]}
                  numberOfLines={1}
                >
                  {item.propertyName}
                </Text>
                <Text style={[styles.netValue, { color: barColor }]}>
                  {formatCurrency(item.net, item.currency, language)}
                </Text>
              </View>
              <View
                style={[
                  styles.track,
                  { backgroundColor: theme.dark ? Colors.surfaceVariantDark : Colors.surfaceVariant },
                ]}
              >
                <View
                  style={[
                    styles.bar,
                    {
                      width: `${barWidth}%`,
                      backgroundColor: barColor,
                    },
                  ]}
                />
              </View>
            </View>
          );
        })}
      </View>
    </ChartCard>
  );
}

const styles = StyleSheet.create({
  title: {
    ...Typography.titleMedium,
  },
  list: {
    gap: Spacing.md,
  },
  row: {
    gap: Spacing.xs,
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  propertyName: {
    ...Typography.bodyMedium,
    fontWeight: '600',
    flex: 1,
  },
  netValue: {
    ...Typography.labelLarge,
    fontWeight: '700',
  },
  track: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 4,
    minWidth: 4,
  },
  empty: {
    paddingVertical: Spacing.lg,
  },
});
