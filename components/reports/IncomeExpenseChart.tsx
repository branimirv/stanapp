import { useMemo } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View, type StyleProp, type ViewStyle } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '@/components/ui/EmptyState';
import { Colors, Spacing, Typography } from '@/constants/theme';
import type { MonthlyIncomeExpense } from '@/types/app.types';

export interface IncomeExpenseChartProps {
  data: MonthlyIncomeExpense[];
  style?: StyleProp<ViewStyle>;
}

export function IncomeExpenseChart({ data, style }: IncomeExpenseChartProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const { width } = useWindowDimensions();

  const chartData = useMemo(
    () =>
      data.flatMap((item, index) => [
      {
        value: item.income,
        label: item.label,
        spacing: 2,
        labelWidth: 56,
        frontColor: Colors.accent,
        topLabelComponent: () => null,
      },
      {
        value: item.expenses,
        frontColor: Colors.danger,
        spacing: index < data.length - 1 ? 18 : 2,
      },
      ]),
    [data],
  );

  if (data.length === 0) {
    return (
      <EmptyState
        title={t('reports.noData')}
        subtitle={t('reports.noDataHint')}
        style={styles.empty}
      />
    );
  }

  const chartWidth = Math.max(width - Spacing.md * 2, data.length * 72);

  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.title, { color: theme.colors.onSurface }]}>
        {t('reports.incomeVsExpenses')}
      </Text>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.accent }]} />
          <Text style={[styles.legendLabel, { color: theme.colors.onSurfaceVariant }]}>
            {t('reports.chartIncome')}
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.danger }]} />
          <Text style={[styles.legendLabel, { color: theme.colors.onSurfaceVariant }]}>
            {t('reports.chartExpenses')}
          </Text>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <BarChart
          data={chartData}
          barWidth={18}
          spacing={8}
          roundedTop
          roundedBottom
          hideRules
          xAxisThickness={1}
          yAxisThickness={0}
          xAxisColor={theme.colors.outline}
          yAxisTextStyle={{ color: theme.colors.onSurfaceVariant, fontSize: 11 }}
          xAxisLabelTextStyle={{ color: theme.colors.onSurfaceVariant, fontSize: 10 }}
          noOfSections={4}
          maxValue={Math.max(...data.flatMap((item) => [item.income, item.expenses]), 1) * 1.2}
          width={chartWidth}
          height={220}
          initialSpacing={12}
          endSpacing={12}
          isAnimated
        />
      </ScrollView>
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
  legendLabel: {
    ...Typography.bodySmall,
  },
  empty: {
    paddingVertical: Spacing.lg,
  },
});
