import { TrendingDown, TrendingUp } from 'lucide-react-native';
import { useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
  type StyleProp,
  type ViewStyle,
  Text,
} from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { useTranslation } from 'react-i18next';

import { DisplayAmount } from '@/components/ui/DisplayAmount';
import { EmptyState } from '@/components/ui/EmptyState';
import { Typography } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { displayFontFamily, Fonts } from '@/lib/fonts';
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
  ReportPeriodComparison,
} from '@/types/app.types';

export interface NetCashFlowChartProps {
  data: MonthlyIncomeExpense[];
  netTotal: number;
  currency?: string;
  language?: Language;
  comparison?: ReportPeriodComparison | null;
  style?: StyleProp<ViewStyle>;
}

type ChartPoint = {
  value: number;
  label: string;
  periodLabel: string;
};

function formatDeltaPercent(value: number): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1).replace('.', ',')} %`;
}

/** Naslov net cash-flow card — big figure, delta chip, line chart. */
export function NetCashFlowChart({
  data,
  netTotal,
  currency = 'EUR',
  language = 'hr',
  comparison = null,
  style,
}: NetCashFlowChartProps) {
  const { theme } = useAppTheme();
  const { colors, elevation, radius } = theme;
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
  const chartColor = colors.primary;
  const deltaValue = comparison?.deltaPercent ?? comparison?.deltaAbsolute ?? null;
  const deltaPositive =
    comparison == null ? true : (comparison.deltaPercent ?? comparison.deltaAbsolute) >= 0;

  if (data.length === 0) {
    return (
      <EmptyState
        title={t('reports.noData')}
        subtitle={t('reports.noDataHint')}
        style={styles.empty}
      />
    );
  }

  const chartWidth = Math.max(width - 68, data.length * 52);
  const yAxisLabelWidth = 36;
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
    yAxisTextStyle: {
      color: colors.muted,
      fontSize: 10,
      fontFamily: Fonts.sans.regular,
    },
    xAxisLabelTextStyle: {
      color: colors.muted,
      fontSize: 10,
      fontFamily: Fonts.sans.semibold,
    },
    xAxisThickness: 0,
    yAxisThickness: 0,
    rulesThickness: StyleSheet.hairlineWidth,
    rulesColor: colors.bd,
    hideRules: false,
    width: chartWidth - yAxisLabelWidth,
    height: scale.height,
    xAxisLabelsAtBottom: true,
    labelsExtraHeight: CHART_LABEL_BAND,
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.cardBd,
          borderRadius: radius.xl,
          ...elevation.card,
        },
        style,
      ]}
    >
      <Text
        style={{
          fontFamily: Fonts.sans.semibold,
          fontSize: Typography.eyebrow.base.size,
          letterSpacing: Typography.eyebrow.base.letterSpacing,
          textTransform: 'uppercase',
          color: colors.muted,
          marginBottom: 11,
        }}
      >
        {t('reports.netCashFlow')}
      </Text>

      <DisplayAmount
        amount={netTotal}
        currency={currency}
        language={language}
        size={Typography.display.heroSm.size}
        lineHeight={Typography.display.heroSm.lineHeight}
        letterSpacing={Typography.display.heroSm.letterSpacing}
      />

      {comparison && deltaValue !== null ? (
        <View style={styles.deltaRow}>
          <View
            style={[
              styles.chip,
              {
                backgroundColor: deltaPositive ? colors.posTint : colors.negTint,
              },
            ]}
          >
            {deltaPositive ? (
              <TrendingUp size={12} color={colors.pos} strokeWidth={2.5} />
            ) : (
              <TrendingDown size={12} color={colors.neg} strokeWidth={2.5} />
            )}
            <Text
              style={{
                fontFamily: Fonts.sans.semibold,
                fontSize: Typography.text.chip.size,
                color: deltaPositive ? colors.pos : colors.neg,
              }}
            >
              {comparison.deltaPercent !== null
                ? formatDeltaPercent(comparison.deltaPercent)
                : formatCurrency(comparison.deltaAbsolute, currency, language)}
            </Text>
          </View>
          <Text
            style={{
              fontFamily: Fonts.sans.semibold,
              fontSize: Typography.eyebrow.sm.size,
              letterSpacing: Typography.eyebrow.sm.letterSpacing,
              textTransform: 'uppercase',
              color: colors.muted,
            }}
          >
            {t('reports.previousPeriod')}
          </Text>
        </View>
      ) : (
        <View style={{ height: 14 }} />
      )}

      {data.length >= 2 ? (
        <View style={[styles.chartClip, { height: CHART_VIEWPORT_HEIGHT }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <LineChart
              areaChart
              curved
              data={chartData}
              color={chartColor}
              startFillColor={chartColor}
              endFillColor={chartColor}
              startOpacity={0.22}
              endOpacity={0.02}
              thickness={2.5}
              hideDataPoints={false}
              dataPointsColor={chartColor}
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
                pointerStripColor: colors.bd,
                pointerStripWidth: 1,
                pointerColor: chartColor,
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
                        { backgroundColor: colors.surface3 },
                      ]}
                    >
                      <Text
                        style={{
                          fontFamily: Fonts.sans.regular,
                          fontSize: 11,
                          color: colors.muted,
                        }}
                      >
                        {item.periodLabel ?? item.label}
                      </Text>
                      <Text
                        style={{
                          fontFamily: displayFontFamily(theme.name),
                          fontSize: 14,
                          color: colors.fg,
                        }}
                      >
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
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingTop: 20,
    paddingHorizontal: 18,
    paddingBottom: 18,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 10,
  },
  deltaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginTop: 14,
    marginBottom: 18,
    flexWrap: 'wrap',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 999,
  },
  chartClip: {
    overflow: 'hidden',
  },
  tooltip: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 2,
  },
  empty: {
    paddingVertical: 24,
  },
});
