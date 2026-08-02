import { TrendingDown, TrendingUp } from 'lucide-react-native';
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

export interface NetCashFlowChartProps {
  data: MonthlyIncomeExpense[];
  netTotal: number;
  currency?: string;
  language?: Language;
  style?: StyleProp<ViewStyle>;
}

type ChartPoint = {
  value: number;
  label: string;
  periodLabel: string;
  dataPointText: string;
};

function formatDelta(value: number): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

export function NetCashFlowChart({
  data,
  netTotal,
  currency = 'EUR',
  language = 'hr',
  style,
}: NetCashFlowChartProps) {
  const { theme, isDark } = useAppTheme();
  const { t } = useTranslation();
  const { width } = useWindowDimensions();

  const chartData = useMemo(() => {
    const axisLabels = formatChartAxisMonths(data, language);
    return data.map((item, index): ChartPoint => ({
      value: item.net,
      label: axisLabels[index],
      periodLabel: formatPeriodShort(item.month, item.year, language),
      dataPointText: String(Math.round(item.net)),
    }));
  }, [data, language]);

  const deltaPct = useMemo(() => {
    if (data.length < 2) return null;
    const first = data[0].net;
    const last = data[data.length - 1].net;
    if (first === 0) return last === 0 ? 0 : 100;
    return ((last - first) / Math.abs(first)) * 100;
  }, [data]);

  const { maxValue, mostNegativeValue } = useMemo(() => {
    const values = data.map((item) => item.net);
    const max = Math.max(...values, 0);
    const min = Math.min(...values, 0);
    return {
      maxValue: max <= 0 ? 1 : max * 1.15,
      mostNegativeValue: min < 0 ? min * 1.15 : 0,
    };
  }, [data]);

  const netColor = netTotal >= 0 ? Colors.accent : Colors.danger;
  const deltaColor =
    deltaPct === null ? theme.colors.onSurfaceVariant : deltaPct >= 0 ? Colors.accent : Colors.danger;

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
      <View style={styles.header}>
        <Text className="text-muted-foreground text-sm font-semibold uppercase tracking-wide">
          {t('reports.netCashFlow')}
        </Text>
        <Text className="text-3xl font-bold" style={{ color: netColor }}>
          {formatCurrency(netTotal, currency, language)}
        </Text>
        {deltaPct !== null ? (
          <View style={styles.deltaRow}>
            {deltaPct >= 0 ? (
              <TrendingUp size={14} color={deltaColor} strokeWidth={2.5} />
            ) : (
              <TrendingDown size={14} color={deltaColor} strokeWidth={2.5} />
            )}
            <Text className="text-sm font-semibold" style={{ color: deltaColor }}>
              {formatDelta(deltaPct)} {t('reports.vsPrevious')}
            </Text>
          </View>
        ) : null}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <LineChart
          areaChart
          curved
          data={chartData}
          color={netTotal >= 0 ? Colors.accent : Colors.danger}
          startFillColor={netTotal >= 0 ? Colors.accent : Colors.danger}
          endFillColor={netTotal >= 0 ? Colors.accent : Colors.danger}
          startOpacity={0.35}
          endOpacity={0.02}
          thickness={2.5}
          hideDataPoints
          hideRules
          xAxisThickness={0}
          yAxisThickness={0}
          yAxisTextStyle={{ color: theme.colors.onSurfaceVariant, fontSize: 10 }}
          xAxisLabelTextStyle={{ color: theme.colors.onSurfaceVariant, fontSize: 10 }}
          xAxisTextNumberOfLines={1}
          noOfSections={4}
          maxValue={maxValue}
          mostNegativeValue={mostNegativeValue}
          width={chartWidth}
          height={180}
          initialSpacing={16}
          endSpacing={16}
          spacing={Math.max(44, chartWidth / Math.max(data.length, 1) - 16)}
          isAnimated
          pointerConfig={{
            activatePointersOnLongPress: false,
            activatePointersInstantlyOnTouch: true,
            pointerStripColor: theme.colors.outline,
            pointerStripWidth: 1,
            pointerColor: netColor,
            radius: 5,
            pointerLabelWidth: 120,
            pointerLabelHeight: 56,
            autoAdjustPointerLabelPosition: true,
            pointerLabelComponent: (items: Array<Partial<ChartPoint>>) => {
              const item = items[0];
              if (!item) return null;
              return (
                <View
                  style={[
                    styles.tooltip,
                    {
                      backgroundColor: isDark ? Colors.surfaceVariantDark : Colors.textPrimary,
                    },
                  ]}
                >
                  <Text style={styles.tooltipLabel}>{item.periodLabel ?? item.label}</Text>
                  <Text style={styles.tooltipValue}>
                    {formatCurrency(Number(item.value), currency, language)}
                  </Text>
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
  header: {
    gap: Spacing.xs,
  },
  deltaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
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
  },
  tooltipValue: {
    ...Typography.labelMedium,
    color: Colors.textInverse,
    fontWeight: '700',
  },
  empty: {
    paddingVertical: Spacing.lg,
  },
});
