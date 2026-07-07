import { TrendingDown, TrendingUp } from 'lucide-react-native';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View, type StyleProp, type ViewStyle } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { ChartCard } from '@/components/reports/ChartCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { formatCurrency } from '@/utils/formatters';
import type { Language, MonthlyIncomeExpense } from '@/types/app.types';

export interface NetCashFlowChartProps {
  data: MonthlyIncomeExpense[];
  netTotal: number;
  currency?: string;
  language?: Language;
  style?: StyleProp<ViewStyle>;
}

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
  const theme = useTheme();
  const { t } = useTranslation();
  const { width } = useWindowDimensions();

  const chartData = useMemo(
    () =>
      data.map((item) => ({
        value: item.net,
        label: item.label,
        dataPointText: String(Math.round(item.net)),
      })),
    [data],
  );

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

  const chartWidth = Math.max(width - Spacing.md * 4, data.length * 64);

  return (
    <ChartCard style={style}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.onSurfaceVariant }]}>
          {t('reports.netCashFlow')}
        </Text>
        <Text style={[styles.heroValue, { color: netColor }]}>
          {formatCurrency(netTotal, currency, language)}
        </Text>
        {deltaPct !== null ? (
          <View style={styles.deltaRow}>
            {deltaPct >= 0 ? (
              <TrendingUp size={14} color={deltaColor} strokeWidth={2.5} />
            ) : (
              <TrendingDown size={14} color={deltaColor} strokeWidth={2.5} />
            )}
            <Text style={[styles.deltaText, { color: deltaColor }]}>
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
          noOfSections={4}
          maxValue={maxValue}
          mostNegativeValue={mostNegativeValue}
          width={chartWidth}
          height={180}
          initialSpacing={16}
          endSpacing={16}
          spacing={Math.max(40, chartWidth / Math.max(data.length, 1) - 20)}
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
            pointerLabelComponent: (items: Array<{ label?: string; value?: number }>) => {
              const item = items[0];
              if (!item) return null;
              return (
                <View
                  style={[
                    styles.tooltip,
                    {
                      backgroundColor: theme.dark ? Colors.surfaceVariantDark : Colors.textPrimary,
                    },
                  ]}
                >
                  <Text style={styles.tooltipLabel}>{item.label}</Text>
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
  title: {
    ...Typography.labelLarge,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  heroValue: {
    ...Typography.displayMedium,
  },
  deltaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  deltaText: {
    ...Typography.bodySmall,
    fontWeight: '600',
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
