import { memo, useCallback, useMemo, useState } from 'react';
import { FlatList, RefreshControl, SectionList, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { ExpenseCard } from '@/components/expense/ExpenseCard';
import { AppSegmentedControl } from '@/components/ui/AppSegmentedControl';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { listPerformanceProps } from '@/constants/list';
import { Spacing, Typography } from '@/constants/theme';
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
  onAddExpense: () => void;
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
  onAddExpense,
}: PropertyExpensesTabProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('all');

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
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>{section.title}</Text>
        <Text style={{ color: theme.colors.onSurfaceVariant }}>
          {formatCurrency(section.total, currency, language)}
        </Text>
      </View>
    ),
    [currency, language, theme.colors.onSurface, theme.colors.onSurfaceVariant],
  );

  if (isLoading) return <SkeletonLoader count={4} style={styles.content} />;

  if (expenses.length === 0) {
    return (
      <EmptyState
        title={t('empty.noExpenses')}
        subtitle={t('empty.noExpensesHint')}
        ctaLabel={canManage ? t('expenses.addNew') : undefined}
        onCtaPress={canManage ? onAddExpense : undefined}
      />
    );
  }

  const periodSwitcher = (
    <View style={styles.periodFilter}>
      <AppSegmentedControl
        segments={segments}
        value={periodFilter}
        onValueChange={handlePeriodChange}
      />
    </View>
  );

  if (periodFilter === 'current_month') {
    return (
      <FlatList
        data={monthExpenses}
        keyExtractor={keyExtractor}
        renderItem={renderExpense}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        {...listPerformanceProps}
        ListHeaderComponent={
          <>
            {periodSwitcher}
            {monthExpenses.length > 0 ? (
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                  {formatPeriod(month, year, language)}
                </Text>
                <Text style={{ color: theme.colors.onSurfaceVariant }}>
                  {formatCurrency(monthExpenseTotal, currency, language)}
                </Text>
              </View>
            ) : null}
          </>
        }
        ListEmptyComponent={<EmptyState title={t('properties.noExpensesThisMonth')} />}
      />
    );
  }

  return (
    <SectionList
      sections={expensesByMonth}
      keyExtractor={keyExtractor}
      renderItem={renderExpense}
      renderSectionHeader={renderSectionHeader}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      {...listPerformanceProps}
      ListHeaderComponent={periodSwitcher}
    />
  );
}

export const PropertyExpensesTab = memo(PropertyExpensesTabComponent);

const styles = StyleSheet.create({
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl + 56,
    gap: Spacing.sm,
  },
  periodFilter: {
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.titleMedium,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    backgroundColor: 'transparent',
  },
});
