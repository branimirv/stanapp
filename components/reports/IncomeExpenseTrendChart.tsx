import { useMemo } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View, type StyleProp, type ViewStyle } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { useTranslation } from 'react-i18next';
import { ChartCard } from '@/components/reports/ChartCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Text } from '@/components/ui/text';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { formatChartAxisMonths, formatCurrency, formatPeriodShort } from '@/utils/formatters';
import type { Language, MonthlyIncomeExpense } from '@/types/app.types';

export interface IncomeExpenseTrendChartProps {
  data: MonthlyIncomeExpense[];
  currency?: string;
  language?: Language;
  style?: StyleProp<ViewStyle>;
}

type ChartPoint = {
  value: number;
  label?: string;
  periodLabel?: string;
};

export function IncomeExpenseTrendChart({
  data,
  currency = 'EUR',
  language = 'hr',
  style,
}: IncomeExpenseTrendChartProps) {
  const { theme, isDark } = useAppTheme();
  const { t } = useTranslation();
  const { width } = useWindowDimensions();

  const incomeData = useMemo(() => {
    const axisLabels = formatChartAxisMonths(data, language);
    return data.map((item, index): ChartPoint => ({
      value: item.income,
      label: axisLabels[index],
      periodLabel: formatPeriodShort(item.month, item.year, language),
    }));
  }, [data, language]);

  const expenseData = useMemo(
    () =>
      data.map((item): ChartPoint => ({
        value: item.expenses,
      })),
    [data],
  );

  const maxValue = useMemo(() => {
    const peak = Math.max(...data.flatMap((item) => [item.income, item.expenses]), 1);
    return peak * 1.15;
  }, [data]);

  if (data.length === 0) {
    return (
      <EmptyState
        title={t('reports.noData')}
        subtitle={t('reports.noDataHint')}
        style={styles.empty}
      />
    );
  }

  const chartWidth = Math.max(width - Spacing.md * 4, data.length * 52);

  return (
    <ChartCard style={style}>
      <Text className="text-lg font-medium">{t('reports.incomeExpenseTrend')}</Text>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.accent }]} />
          <Text className="text-muted-foreground text-xs">{t('reports.chartIncome')}</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.danger }]} />
          <Text className="text-muted-foreground text-xs">{t('reports.chartExpenses')}</Text>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <LineChart
          areaChart
          curved
          data={incomeData}
          data2={expenseData}
          color1={Colors.accent}
          color2={Colors.danger}
          startFillColor1={Colors.accent}
          endFillColor1={Colors.accent}
          startFillColor2={Colors.danger}
          endFillColor2={Colors.danger}
          startOpacity1={0.2}
          endOpacity1={0.02}
          startOpacity2={0.15}
          endOpacity2={0.02}
          thickness1={2.5}
          thickness2={2.5}
          hideDataPoints1
          hideDataPoints2
          hideRules
          xAxisThickness={0}
          yAxisThickness={0}
          yAxisTextStyle={{ color: theme.colors.onSurfaceVariant, fontSize: 10 }}
          xAxisLabelTextStyle={{ color: theme.colors.onSurfaceVariant, fontSize: 10 }}
          xAxisTextNumberOfLines={1}
          noOfSections={4}
          maxValue={maxValue}
          width={chartWidth}
          height={200}
          initialSpacing={16}
          endSpacing={16}
          spacing={Math.max(44, chartWidth / Math.max(data.length, 1) - 16)}
          isAnimated
          pointerConfig={{
            activatePointersOnLongPress: false,
            activatePointersInstantlyOnTouch: true,
            pointerStripColor: theme.colors.outline,
            pointerStripWidth: 1,
            pointerColor: theme.colors.primary,
            radius: 5,
            pointerLabelWidth: 140,
            pointerLabelHeight: 72,
            autoAdjustPointerLabelPosition: true,
            pointerLabelComponent: (items: Array<Partial<ChartPoint>>) => {
              const income = items[0];
              const expenses = items[1];
              if (!income) return null;
              return (
                <View
                  style={[
                    styles.tooltip,
                    {
                      backgroundColor: isDark ? Colors.surfaceVariantDark : Colors.textPrimary,
                    },
                  ]}
                >
                  <Text style={styles.tooltipLabel}>{income.periodLabel ?? income.label}</Text>
                  <Text style={[styles.tooltipIncome, { color: Colors.accent }]}>
                    {t('reports.chartIncome')}: {formatCurrency(Number(income.value), currency, language)}
                  </Text>
                  {expenses ? (
                    <Text style={[styles.tooltipExpense, { color: Colors.danger }]}>
                      {t('reports.chartExpenses')}: {formatCurrency(Number(expenses.value), currency, language)}
                    </Text>
                  ) : null}
                </View>
              );
            },
          }}
        />
      </ScrollView>
    </ChartCard>
  );
}

const styles = StyleSheet.create({
  legend: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  tooltip: {
    borderRadius: 8,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    gap: 2,
  },
  tooltipLabel: {
    ...Typography.labelSmall,
    color: Colors.textDisabled,
    marginBottom: 2,
  },
  tooltipIncome: {
    ...Typography.labelSmall,
    fontWeight: '600',
  },
  tooltipExpense: {
    ...Typography.labelSmall,
    fontWeight: '600',
  },
  empty: {
    paddingVertical: Spacing.lg,
  },
});
