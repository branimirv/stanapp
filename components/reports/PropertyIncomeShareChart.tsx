import { useMemo, useState } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { useTranslation } from 'react-i18next';
import { ChartCard } from '@/components/reports/ChartCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Text } from '@/components/ui/text';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Colors, Spacing } from '@/constants/theme';
import { formatCurrency } from '@/utils/formatters';
import type { Language, PropertyReportSummary } from '@/types/app.types';

const PROPERTY_COLORS = [
  Colors.primary,
  Colors.accent,
  Colors.warning,
  Colors.typeOther,
  Colors.typeApartment,
  Colors.typeHouse,
  Colors.typeGarage,
  Colors.statusPartial,
];

export interface PropertyIncomeShareChartProps {
  data: PropertyReportSummary[];
  currency?: string;
  language?: Language;
  style?: StyleProp<ViewStyle>;
}

export function PropertyIncomeShareChart({
  data,
  currency = 'EUR',
  language = 'hr',
  style,
}: PropertyIncomeShareChartProps) {
  const { isDark } = useAppTheme();
  const { t } = useTranslation();
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  const incomeItems = useMemo(
    () => data.filter((item) => item.totalRentCollected > 0),
    [data],
  );

  const totalIncome = useMemo(
    () => incomeItems.reduce((sum, item) => sum + item.totalRentCollected, 0),
    [incomeItems],
  );

  const pieData = useMemo(
    () =>
      incomeItems.map((item, index) => ({
        value: item.totalRentCollected,
        color: PROPERTY_COLORS[index % PROPERTY_COLORS.length],
        text: totalIncome > 0 ? `${Math.round((item.totalRentCollected / totalIncome) * 100)}%` : '0%',
        onPress: () => setFocusedIndex(index),
      })),
    [incomeItems, totalIncome],
  );

  const focusedItem =
    focusedIndex !== null && incomeItems[focusedIndex] ? incomeItems[focusedIndex] : null;

  if (incomeItems.length === 0 || totalIncome <= 0) {
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
      <Text className="text-lg font-medium">{t('reports.incomeShare')}</Text>

      <View style={styles.chartWrap}>
        <PieChart
          data={pieData}
          donut
          radius={96}
          innerRadius={60}
          innerCircleColor={isDark ? Colors.surfaceDark : Colors.surface}
          centerLabelComponent={() => (
            <View style={styles.centerLabel}>
              {focusedItem ? (
                <>
                  <Text
                    className="text-muted-foreground text-center text-[11px] font-medium"
                    numberOfLines={2}
                  >
                    {focusedItem.propertyName}
                  </Text>
                  <Text className="text-center text-lg font-medium">
                    {formatCurrency(focusedItem.totalRentCollected, focusedItem.currency, language)}
                  </Text>
                </>
              ) : (
                <>
                  <Text className="text-muted-foreground text-center text-[11px] font-medium">
                    {t('reports.totalIncome')}
                  </Text>
                  <Text className="text-center text-lg font-medium">
                    {formatCurrency(totalIncome, currency, language)}
                  </Text>
                </>
              )}
            </View>
          )}
          showText
          textColor={Colors.textInverse}
          textSize={10}
          focusOnPress
          isAnimated
        />
      </View>

      <View style={styles.list}>
        {incomeItems.map((item, index) => {
          const share = totalIncome > 0 ? (item.totalRentCollected / totalIncome) * 100 : 0;
          const color = PROPERTY_COLORS[index % PROPERTY_COLORS.length];

          return (
            <View key={item.propertyId} style={styles.listRow} className="border-border">
              <View style={styles.listLeft}>
                <View style={[styles.colorDot, { backgroundColor: color }]} />
                <Text className="shrink text-sm font-medium" numberOfLines={1}>
                  {item.propertyName}
                </Text>
              </View>
              <View style={styles.listMeta}>
                <Text className="text-lg font-medium">
                  {formatCurrency(item.totalRentCollected, item.currency, language)}
                </Text>
                <Text className="text-muted-foreground text-xs">
                  {t('reports.categoryShare')}: {share.toFixed(1)}%
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </ChartCard>
  );
}

const styles = StyleSheet.create({
  chartWrap: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  centerLabel: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    maxWidth: 100,
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
  listLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  listMeta: {
    alignItems: 'flex-end',
    gap: 2,
  },
  empty: {
    paddingVertical: Spacing.lg,
  },
});
