import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { useTranslation } from 'react-i18next';
import { CategoryBadge } from '@/components/expense/CategoryBadge';
import { ChartCard } from '@/components/reports/ChartCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Text } from '@/components/ui/text';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Colors, Spacing } from '@/constants/theme';
import { getCategoryLabel } from '@/utils/expense';
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
  const { isDark } = useAppTheme();
  const { t, i18n } = useTranslation();
  const resolvedLanguage = language ?? (i18n.language === 'en' ? 'en' : 'hr');
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  const total = data.reduce((sum, item) => sum + item.amount, 0);

  const pieData = useMemo(
    () =>
      data.map((item, index) => ({
        value: item.amount,
        color: item.color,
        text: `${Math.round(item.percentage)}%`,
        onPress: () => setFocusedIndex(index),
      })),
    [data],
  );

  const focusedItem = focusedIndex !== null && data[focusedIndex] ? data[focusedIndex] : null;

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
    <ChartCard style={style}>
      <Text className="text-lg font-medium">{t('reports.expenseBreakdown')}</Text>

      <View style={styles.chartWrap}>
        <PieChart
          data={pieData}
          donut
          radius={100}
          innerRadius={62}
          innerCircleColor={isDark ? Colors.surfaceDark : Colors.surface}
          centerLabelComponent={() => (
            <View style={styles.centerLabel}>
              {focusedItem ? (
                <>
                  <Text className="text-muted-foreground text-center text-xs font-medium">
                    {getCategoryLabel(
                      { key: focusedItem.categoryKey, name: focusedItem.categoryName },
                      t,
                    )}
                  </Text>
                  <Text className="text-center text-lg font-medium">
                    {formatCurrency(focusedItem.amount, currency, resolvedLanguage)}
                  </Text>
                  <Text className="text-muted-foreground text-center text-xs">
                    {focusedItem.percentage.toFixed(1)}%
                  </Text>
                </>
              ) : (
                <>
                  <Text className="text-muted-foreground text-center text-xs font-medium">
                    {t('common.total')}
                  </Text>
                  <Text className="text-center text-lg font-medium">
                    {formatCurrency(total, currency, resolvedLanguage)}
                  </Text>
                </>
              )}
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
        {data.map((item, index) => (
          <PressableRow
            key={item.categoryId}
            item={item}
            index={index}
            focusedIndex={focusedIndex}
            onFocus={setFocusedIndex}
            currency={currency}
            language={resolvedLanguage}
          />
        ))}
      </View>
    </ChartCard>
  );
}

interface PressableRowProps {
  item: CategoryBreakdown;
  index: number;
  focusedIndex: number | null;
  onFocus: (index: number) => void;
  currency: string;
  language: Language;
}

function PressableRow({
  item,
  index,
  focusedIndex,
  onFocus,
  currency,
  language,
}: PressableRowProps) {
  const { isDark } = useAppTheme();
  const { t } = useTranslation();
  const isFocused = focusedIndex === index;

  return (
    <Pressable
      onPress={() => onFocus(index)}
      style={[
        styles.listRow,
        {
          backgroundColor: isFocused
            ? isDark
              ? Colors.surfaceVariantDark
              : Colors.primaryLight
            : 'transparent',
        },
      ]}
      className="border-border"
    >
      <CategoryBadge
        categoryKey={item.categoryKey}
        categoryName={item.categoryName}
        icon={item.icon}
        color={item.color}
      />
      <View style={styles.listMeta}>
        <Text className="text-lg font-medium">
          {formatCurrency(item.amount, currency, language)}
        </Text>
        <Text className="text-muted-foreground text-xs">
          {t('reports.categoryShare')}: {item.percentage.toFixed(1)}%
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chartWrap: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  centerLabel: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    maxWidth: 110,
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
    paddingTop: Spacing.xs,
    paddingHorizontal: Spacing.xs,
    borderRadius: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  listMeta: {
    alignItems: 'flex-end',
    gap: 2,
  },
  empty: {
    paddingVertical: Spacing.lg,
  },
});
