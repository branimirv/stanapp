import { format as formatDateFns, parseISO } from 'date-fns';
import { ChevronRight, Plus, Receipt } from 'lucide-react-native';
import { memo, useCallback, useMemo, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { ExpenseListRow } from '@/components/expense/ExpenseListRow';
import { PROPERTY_SCENE_TOP_GAP } from '@/components/property/PropertyTabBar';
import { AppButton } from '@/components/ui/AppButton';
import { DisplayAmount } from '@/components/ui/DisplayAmount';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { Spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { displayFontFamily } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import type { Expense, ExpenseCategory, Language } from '@/types/app.types';
import { formatPeriod } from '@/utils/formatters';

type PeriodFilter = 'current_month' | 'all';

const PREVIEW_COUNT = 3;

export interface PropertyExpensesTabProps {
  expenses: Expense[];
  monthExpenses: Expense[];
  monthExpenseTotal: number;
  month: number;
  year: number;
  isLoading: boolean;
  canManage: boolean;
  currency: string;
  language: Language;
  categoryMap: Map<string, ExpenseCategory>;
  refreshing: boolean;
  onRefresh: () => void;
  onSelectExpense: (expenseId: string) => void;
  onAddExpense: () => void;
  /** Clears floating header + tabs; content still peeks under glass. */
  contentTopInset?: number;
}

function capitalizePeriod(label: string, language: Language): string {
  return label.replace(/^./, (ch) =>
    ch.toLocaleUpperCase(language === 'en' ? 'en' : 'hr'),
  );
}

function PropertyExpensesTabComponent({
  expenses,
  monthExpenses,
  monthExpenseTotal,
  month,
  year,
  isLoading,
  canManage,
  currency,
  language,
  categoryMap,
  refreshing,
  onRefresh,
  onSelectExpense,
  onAddExpense,
  contentTopInset = 0,
}: PropertyExpensesTabProps) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const { colors, elevation } = theme;
  const insets = useSafeAreaInsets();
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('current_month');
  const [expanded, setExpanded] = useState(false);

  const listTopPad = (contentTopInset || 0) + PROPERTY_SCENE_TOP_GAP;
  const ctaBottom = Math.max(insets.bottom, 12) + 10;

  const sortedAll = useMemo(() => {
    return [...expenses].sort((a, b) => b.billing_date.localeCompare(a.billing_date));
  }, [expenses]);

  const sourceList = periodFilter === 'current_month' ? monthExpenses : sortedAll;
  const isEmptyList = sourceList.length === 0;
  const listBottomPad =
    canManage && !isEmptyList ? 72 + ctaBottom : Spacing.xxl;

  const visibleExpenses = useMemo(() => {
    if (expanded || sourceList.length <= PREVIEW_COUNT) return sourceList;
    return sourceList.slice(0, PREVIEW_COUNT);
  }, [expanded, sourceList]);

  const hasMore = sourceList.length > PREVIEW_COUNT;
  const headerTotal =
    periodFilter === 'current_month'
      ? monthExpenseTotal
      : sourceList.reduce((sum, item) => sum + Number(item.amount), 0);
  const headerTitle =
    periodFilter === 'current_month'
      ? capitalizePeriod(formatPeriod(month, year, language), language)
      : t('properties.expensePeriodAll');

  const lastExpenseShortDate = useMemo(() => {
    if (expenses.length === 0) return null;
    let latest = expenses[0].billing_date;
    for (const expense of expenses) {
      if (expense.billing_date > latest) latest = expense.billing_date;
    }
    return formatDateFns(parseISO(latest), 'dd.MM.');
  }, [expenses]);

  const handlePeriodChange = useCallback((next: PeriodFilter) => {
    setPeriodFilter(next);
    setExpanded(false);
  }, []);

  if (isLoading) {
    return (
      <SkeletonLoader
        count={4}
        style={{ paddingHorizontal: Spacing.gutter, paddingTop: listTopPad }}
      />
    );
  }

  return (
    <View className="flex-1">
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: Spacing.gutter,
          paddingTop: listTopPad,
          paddingBottom: listBottomPad,
        }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        <View className="bg-surface-2 mb-4.5 min-h-10 flex-row gap-1.25 rounded-full p-1">
          {(
            [
              { value: 'current_month' as const, label: t('properties.expensePeriodThisMonth') },
              { value: 'all' as const, label: t('properties.expensePeriodAll') },
            ] as const
          ).map((seg) => {
            const on = periodFilter === seg.value;
            return (
              <Pressable
                key={seg.value}
                onPress={() => handlePeriodChange(seg.value)}
                className={cn(
                  'flex-1 items-center justify-center rounded-full px-1 py-2',
                  on && 'bg-surface-3',
                )}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
              >
                <Text
                  className={cn(
                    'text-center text-xs font-semibold tracking-[-0.12px]',
                    on ? 'text-fg' : 'text-muted',
                  )}
                >
                  {seg.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {isEmptyList ? (
          <>
            <EmptyState
              icon={Receipt}
              title={t(
                periodFilter === 'current_month'
                  ? 'properties.noExpensesThisMonth'
                  : 'empty.noExpenses',
              )}
              subtitle={t('empty.noExpensesHint')}
              ctaLabel={canManage ? t('expenses.addNew') : undefined}
              ctaIcon={canManage ? Plus : undefined}
              onCtaPress={canManage ? onAddExpense : undefined}
            />
            {lastExpenseShortDate ? (
              <Text className="text-muted mt-6 text-center text-[10px] font-semibold tracking-[0.8px] uppercase">
                {t('expenses.lastExpenseRecorded', { date: lastExpenseShortDate })}
              </Text>
            ) : null}
          </>
        ) : (
          <>
            <View className="mb-3 flex-row items-baseline justify-between gap-3">
              <Text
                className="text-fg flex-1 text-[19px] tracking-[-0.4px]"
                style={{ fontFamily: displayFontFamily(theme.name) }}
                numberOfLines={1}
              >
                {headerTitle}
              </Text>
              <DisplayAmount
                amount={headerTotal}
                currency={currency}
                language={language}
                size={22}
              />
            </View>

            <View
              className="border-card-bd bg-surface mb-3.5 rounded-xl border px-4.5 pt-1 pb-1.5"
              style={elevation.card}
            >
              {visibleExpenses.map((expense, index) => (
                <ExpenseListRow
                  key={expense.id}
                  expense={expense}
                  category={categoryMap.get(expense.category_id)}
                  currency={currency}
                  language={language}
                  showDivider={index > 0}
                  onPress={onSelectExpense}
                />
              ))}
            </View>

            {hasMore ? (
              <Pressable
                onPress={() => setExpanded((current) => !current)}
                className="bg-surface-2 mb-2 min-h-12 flex-row items-center justify-center gap-1.5 rounded-full px-4.5"
                accessibilityRole="button"
                accessibilityState={{ expanded }}
              >
                <Text className="text-fg text-sm font-semibold">
                  {expanded ? t('common.showLess') : t('properties.seeAllExpenses')}
                </Text>
                {!expanded ? (
                  <ChevronRight size={16} color={colors.fg} strokeWidth={2} />
                ) : null}
              </Pressable>
            ) : null}
          </>
        )}
      </ScrollView>

      {canManage && !isEmptyList ? (
        <View
          pointerEvents="box-none"
          style={[styles.ctaWrap, { paddingBottom: ctaBottom }]}
        >
          <AppButton
            mode="contained"
            onPress={onAddExpense}
            className="h-12 w-full"
            accessibilityLabel={t('dashboard.addExpense')}
            style={styles.ctaShadow}
          >
            <View className="flex-row items-center justify-center gap-2">
              <Plus size={18} color={colors.onPrimary} strokeWidth={2.5} />
              <Text className="text-on-primary text-[15px] font-semibold tracking-[-0.15px]">
                {t('dashboard.addExpense')}
              </Text>
            </View>
          </AppButton>
        </View>
      ) : null}
    </View>
  );
}

export const PropertyExpensesTab = memo(PropertyExpensesTabComponent);

const styles = StyleSheet.create({
  ctaWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: Spacing.gutter,
  },
  ctaShadow: {
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.28,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
});
