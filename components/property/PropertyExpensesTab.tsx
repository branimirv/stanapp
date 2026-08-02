import { memo, useCallback, useMemo, useState } from 'react';
import { FlatList, RefreshControl, SectionList, StyleSheet, View } from 'react-native';
import { Receipt } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { ExpenseCard } from '@/components/expense/ExpenseCard';
import { AppSegmentedControl } from '@/components/ui/AppSegmentedControl';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { Text } from '@/components/ui/text';
import { PROPERTY_SCENE_TOP_GAP } from '@/components/property/PropertyTabBar';
import { listPerformanceProps } from '@/constants/list';
import { Spacing } from '@/constants/theme';
import type { Expense, ExpenseCategory, Language } from '@/types/app.types';
import { formatCurrency, formatPeriod } from '@/utils/formatters';

type PeriodFilter = 'current_month' | 'all';

interface ExpenseMonthSection {
  title: string;
  total: number;
  data: Expense[];
}

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
  onMarkExpensePaid: (expenseId: string) => void;
  /** Clears floating header + tabs; content still peeks under glass. */
  contentTopInset?: number;
}

function keyExtractor(expense: Expense) {
  return expense.id;
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
  onMarkExpensePaid,
  contentTopInset = 0,
}: PropertyExpensesTabProps) {
  const { t } = useTranslation();
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('all');
  const listTopPad = (contentTopInset || 0) + PROPERTY_SCENE_TOP_GAP;

  const expensesByMonth = useMemo<ExpenseMonthSection[]>(() => {
    const groups = new Map<string, Expense[]>();
    for (const expense of expenses) {
      const key = expense.billing_date.slice(0, 7);
      const list = groups.get(key) ?? [];
      list.push(expense);
      groups.set(key, list);
    }
    return Array.from(groups.entries())
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([key, items]) => {
        const [groupYear, groupMonth] = key.split('-').map(Number);
        return {
          title: formatPeriod(groupMonth ?? 1, groupYear ?? 2000, language),
          data: items,
          total: items.reduce((sum, expense) => sum + expense.amount, 0),
        };
      });
  }, [expenses, language]);

  const segments = useMemo(
    () => [
      { label: t('properties.expensePeriodThisMonth'), value: 'current_month' },
      { label: t('properties.expensePeriodAll'), value: 'all' },
    ],
    [t],
  );

  const handlePeriodChange = useCallback((value: string) => {
    setPeriodFilter(value as PeriodFilter);
  }, []);

  const renderExpense = useCallback(
    ({ item }: { item: Expense }) => (
      <ExpenseCard
        expense={item}
        category={categoryMap.get(item.category_id)}
        currency={currency}
        language={language}
        onPress={onSelectExpense}
        onMarkPaid={canManage && !item.paid_at ? onMarkExpensePaid : undefined}
      />
    ),
    [canManage, categoryMap, currency, language, onMarkExpensePaid, onSelectExpense],
  );

  const renderSectionHeader = useCallback(
    ({ section }: { section: ExpenseMonthSection }) => (
      <View className="flex-row items-end justify-between gap-2 py-3">
        <Text className="text-foreground text-base font-bold">{section.title}</Text>
        <Text className="text-muted-foreground text-sm font-medium">
          {formatCurrency(section.total, currency, language)}
        </Text>
      </View>
    ),
    [currency, language],
  );

  if (isLoading) {
    return <SkeletonLoader count={4} style={[styles.content, { paddingTop: listTopPad }]} />;
  }

  if (expenses.length === 0) {
    return (
      <View className="flex-1" style={{ paddingTop: listTopPad }}>
        <EmptyState
          icon={Receipt}
          title={t('empty.noExpenses')}
          subtitle={t('empty.noExpensesHint')}
        />
      </View>
    );
  }

  const periodSwitcher = (
    <View className="mb-3">
      <AppSegmentedControl
        segments={segments}
        value={periodFilter}
        onValueChange={handlePeriodChange}
        className="rounded-full"
      />
    </View>
  );

  if (periodFilter === 'current_month') {
    return (
      <FlatList
        data={monthExpenses}
        keyExtractor={keyExtractor}
        renderItem={renderExpense}
        contentContainerStyle={[styles.content, { paddingTop: listTopPad }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        {...listPerformanceProps}
        ListHeaderComponent={
          <>
            {periodSwitcher}
            {monthExpenses.length > 0 ? (
              <View className="flex-row items-end justify-between gap-2 py-3">
                <Text className="text-foreground text-base font-bold">
                  {formatPeriod(month, year, language)}
                </Text>
                <Text className="text-muted-foreground text-sm font-medium">
                  {formatCurrency(monthExpenseTotal, currency, language)}
                </Text>
              </View>
            ) : null}
          </>
        }
        ListEmptyComponent={
          <EmptyState
            icon={Receipt}
            title={t('properties.noExpensesThisMonth')}
            subtitle={t('empty.noExpensesHint')}
          />
        }
      />
    );
  }

  return (
    <SectionList
      sections={expensesByMonth}
      keyExtractor={keyExtractor}
      renderItem={renderExpense}
      renderSectionHeader={renderSectionHeader}
      contentContainerStyle={[styles.content, { paddingTop: listTopPad }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      {...listPerformanceProps}
      ListHeaderComponent={periodSwitcher}
    />
  );
}

export const PropertyExpensesTab = memo(PropertyExpensesTabComponent);

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl + 56,
  },
});
