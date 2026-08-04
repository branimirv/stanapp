import { TrendingDown, TrendingUp } from 'lucide-react-native';
import { useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { useTranslation } from 'react-i18next';
import { ChartCard } from '@/components/reports/ChartCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Text } from '@/components/ui/text';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Colors, Spacing, Typography } from '@/constants/theme';
import {
  CHART_LABEL_BAND,
  CHART_VIEWPORT_HEIGHT,
  formatChartAxisValue,
  getSignedChartScale,
} from '@/utils/chartScale';
import { formatChartAxisMonths, formatCurrency, formatPeriodShort } from '@/utils/formatters';
import type {
  Language,
  MonthlyIncomeExpense,
  ReportExpensePaymentStatus,
  ReportPeriodComparison,
} from '@/types/app.types';

export interface NetCashFlowChartProps {
  data: MonthlyIncomeExpense[];
  netTotal: number;
  currency?: string;
  language?: Language;
  comparison?: ReportPeriodComparison | null;
  expensePaymentStatus?: ReportExpensePaymentStatus;
  style?: StyleProp<ViewStyle>;
}

type ChartPoint = {
  value: number;
  label: string;
  periodLabel: string;
};

function formatDeltaPercent(value: number): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

function formatDeltaAbsolute(value: number, currency: string, language: Language): string {
  const formatted = formatCurrency(Math.abs(value), currency, language);
  if (value > 0) return `+${formatted}`;
  if (value < 0) return `−${formatted}`;
  return formatted;
}

interface SignedComparisonRowProps {
  label: string;
  value: number;
  maxAbs: number;
  currency: string;
  language: Language;
  trackColor: string;
  emphasize?: boolean;
}

function SignedComparisonRow({
  label,
  value,
  maxAbs,
  currency,
  language,
  trackColor,
  emphasize = false,
}: SignedComparisonRowProps) {
  const color = value >= 0 ? Colors.accent : Colors.danger;
  const fillRatio = maxAbs > 0 ? Math.min(Math.abs(value) / maxAbs, 1) : 0;

  return (
    <View style={styles.compareRow}>
      <View style={styles.compareMeta}>
        <Text
          className={
            emphasize
              ? 'text-foreground shrink text-sm font-semibold'
              : 'text-muted-foreground shrink text-sm font-medium'
          }
          numberOfLines={1}
        >
          {label}
        </Text>
        <Text className="text-sm font-bold" style={{ color }}>
          {formatCurrency(value, currency, language)}
        </Text>
      </View>
      <View style={[styles.compareTrack, { backgroundColor: trackColor }]}>
        <View style={styles.compareHalf}>
          {value < 0 ? (
            <View
              style={[
                styles.compareFill,
                styles.compareFillNegative,
                { width: `${fillRatio * 100}%`, backgroundColor: color },
              ]}
            />
          ) : null}
        </View>
        <View style={[styles.compareZero, { backgroundColor: Colors.textDisabled }]} />
        <View style={styles.compareHalf}>
          {value > 0 ? (
            <View
              style={[
                styles.compareFill,
                styles.compareFillPositive,
                { width: `${fillRatio * 100}%`, backgroundColor: color },
              ]}
            />
          ) : null}
        </View>
      </View>
    </View>
  );
}

interface SinglePeriodComparisonProps {
  currentLabel: string;
  currentValue: number;
  previousValue: number | null;
  currency: string;
  language: Language;
  trackColor: string;
}

function SinglePeriodComparison({
  currentLabel,
  currentValue,
  previousValue,
  currency,
  language,
  trackColor,
}: SinglePeriodComparisonProps) {
  const { t } = useTranslation();
  const maxAbs = Math.max(
    Math.abs(currentValue),
    previousValue !== null ? Math.abs(previousValue) : 0,
    1,
  );

  return (
    <View style={[styles.compareWrap, { height: CHART_VIEWPORT_HEIGHT }]}>
      <SignedComparisonRow
        label={currentLabel}
        value={currentValue}
        maxAbs={maxAbs}
        currency={currency}
        language={language}
        trackColor={trackColor}
        emphasize
      />
      {previousValue !== null ? (
        <SignedComparisonRow
          label={t('reports.previousPeriod')}
          value={previousValue}
          maxAbs={maxAbs}
          currency={currency}
          language={language}
          trackColor={trackColor}
        />
      ) : (
        <Text className="text-muted-foreground text-xs">{t('reports.singlePeriodHint')}</Text>
      )}
    </View>
  );
}

export function NetCashFlowChart({
  data,
  netTotal,
  currency = 'EUR',
  language = 'hr',
  comparison = null,
  expensePaymentStatus = 'all',
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
    }));
  }, [data, language]);

  const scale = useMemo(() => getSignedChartScale(data.map((item) => item.net)), [data]);

  const netColor = netTotal >= 0 ? Colors.accent : Colors.danger;
  const deltaValue = comparison?.deltaAbsolute ?? null;
  const deltaColor =
    deltaValue === null
      ? theme.colors.onSurfaceVariant
      : deltaValue >= 0
        ? Colors.accent
        : Colors.danger;

  const paymentStatusCue =
    expensePaymentStatus === 'paid'
      ? t('reports.netPaidExpensesOnly')
      : expensePaymentStatus === 'unpaid'
        ? t('reports.netUnpaidExpensesOnly')
        : null;

  const useSinglePeriodView = data.length < 2;
  const trackColor = isDark ? Colors.surfaceVariantDark : Colors.surfaceVariant;

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
  const yAxisLabelWidth = 40;
  const sharedAxisProps = {
    maxValue: scale.maxValue,
    mostNegativeValue: scale.mostNegativeValue,
    noOfSections: scale.noOfSections,
    noOfSectionsBelowXAxis: scale.noOfSectionsBelowXAxis,
    stepValue: scale.stepValue,
    negativeStepValue: scale.stepValue,
    roundToDigits: 0,
    yAxisLabelWidth,
    formatYLabel: formatChartAxisValue,
    yAxisTextStyle: { color: theme.colors.onSurfaceVariant, fontSize: 10 },
    xAxisLabelTextStyle: { color: theme.colors.onSurfaceVariant, fontSize: 10 },
    xAxisThickness: 0,
    yAxisThickness: 0,
    rulesThickness: StyleSheet.hairlineWidth,
    rulesColor: theme.colors.outline,
    hideRules: false,
    width: chartWidth - yAxisLabelWidth,
    height: scale.height,
    xAxisLabelsAtBottom: true,
    labelsExtraHeight: CHART_LABEL_BAND,
  };

  return (
    <ChartCard style={style}>
      <View style={styles.header}>
        <Text className="text-muted-foreground text-sm font-semibold uppercase tracking-wide">
          {t('reports.netCashFlow')}
        </Text>
        <Text className="text-3xl font-bold" style={{ color: netColor }}>
          {formatCurrency(netTotal, currency, language)}
        </Text>
        {paymentStatusCue ? (
          <Text className="text-muted-foreground text-xs font-medium">{paymentStatusCue}</Text>
        ) : null}
        {comparison ? (
          <View style={styles.deltaRow}>
            {comparison.deltaAbsolute >= 0 ? (
              <TrendingUp size={14} color={deltaColor} strokeWidth={2.5} />
            ) : (
              <TrendingDown size={14} color={deltaColor} strokeWidth={2.5} />
            )}
            <Text className="text-sm font-semibold" style={{ color: deltaColor }}>
              {formatDeltaAbsolute(comparison.deltaAbsolute, currency, language)}
              {comparison.deltaPercent !== null
                ? ` · ${formatDeltaPercent(comparison.deltaPercent)}`
                : ''}{' '}
              {t('reports.vsPrevious')}
            </Text>
          </View>
        ) : null}
      </View>

      {useSinglePeriodView ? (
        <SinglePeriodComparison
          currentLabel={chartData[0]?.periodLabel ?? t('reports.thisPeriod')}
          currentValue={netTotal}
          previousValue={comparison ? comparison.previousNet : null}
          currency={currency}
          language={language}
          trackColor={trackColor}
        />
      ) : (
        <View style={[styles.chartClip, { height: CHART_VIEWPORT_HEIGHT }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <LineChart
              areaChart
              curved
              data={chartData}
              color={netColor}
              startFillColor={netColor}
              endFillColor={netColor}
              startOpacity={0.28}
              endOpacity={0.02}
              thickness={2.5}
              hideDataPoints={false}
              dataPointsColor={netColor}
              dataPointsRadius={3.5}
              textFontSize={0}
              showValuesAsDataPointsText={false}
              xAxisTextNumberOfLines={1}
              initialSpacing={16}
              endSpacing={16}
              spacing={Math.max(44, chartWidth / Math.max(data.length, 1) - 16)}
              isAnimated
              animateOnDataChange
              pointerConfig={{
                activatePointersOnLongPress: false,
                activatePointersInstantlyOnTouch: true,
                pointerStripColor: theme.colors.outline,
                pointerStripWidth: 1,
                pointerColor: netColor,
                radius: 5,
                pointerLabelWidth: 128,
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
              {...sharedAxisProps}
              width={Math.max(chartWidth - yAxisLabelWidth, data.length * 52)}
            />
          </ScrollView>
        </View>
      )}
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
    flexWrap: 'wrap',
  },
  chartClip: {
    overflow: 'hidden',
  },
  compareWrap: {
    justifyContent: 'center',
    gap: Spacing.lg,
  },
  compareRow: {
    gap: Spacing.sm,
  },
  compareMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  compareTrack: {
    height: 12,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  compareHalf: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
  },
  compareZero: {
    width: StyleSheet.hairlineWidth * 2,
    height: '100%',
  },
  compareFill: {
    height: 12,
    borderRadius: 6,
    minWidth: 4,
  },
  compareFillNegative: {
    alignSelf: 'flex-end',
  },
  compareFillPositive: {
    alignSelf: 'flex-start',
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
