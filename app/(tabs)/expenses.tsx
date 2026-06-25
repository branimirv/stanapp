import { router, useLocalSearchParams } from 'expo-router';
import { format, parseISO } from 'date-fns';
import { Receipt } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ExpenseCard } from '@/components/expense/ExpenseCard';
import { AppFab } from '@/components/ui/AppFab';
import { AppPicker, type PickerOption } from '@/components/ui/AppPicker';
import { AppSegmentedControl } from '@/components/ui/AppSegmentedControl';
import { AppTextInput } from '@/components/ui/AppTextInput';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { Spacing, Typography } from '@/constants/theme';
import { useExpenseCategories } from '@/hooks/useExpenseCategories';
import { useExpenses } from '@/hooks/useExpenses';
import { useProfile } from '@/hooks/useProfile';
import { useProperties } from '@/hooks/useProperties';
import { useUiStore } from '@/stores/uiStore';
import { formatPeriod } from '@/utils/formatters';
import type { Expense, ExpenseStatusFilter, ExpenseType, Language } from '@/types/app.types';

type StatusFilter = 'all' | ExpenseStatusFilter;
type RecurringFilter = 'all' | 'recurring' | 'one_time';
type TypeFilter = 'all' | ExpenseType;

interface ExpenseSection {
  title: string;
  month: number;
  year: number;
  total: number;
  data: Expense[];
}

export default function ExpensesScreen() {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ filter?: string }>();
  const showConfirmDialog = useUiStore((state) => state.showConfirmDialog);
  const showToast = useUiStore((state) => state.showToast);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [recurringFilter, setRecurringFilter] = useState<RecurringFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [propertyFilter, setPropertyFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (params.filter === 'overdue') {
      setStatusFilter('overdue');
    }
  }, [params.filter]);

  const expenseStatus = statusFilter === 'all' ? undefined : statusFilter;
  const propertyId = propertyFilter === 'all' ? undefined : propertyFilter;

  const { expenses, isLoading, error, refetch, markAsPaid, remove } = useExpenses({
    status: expenseStatus,
    propertyId,
  });
  const { properties } = useProperties();
  const { categories } = useExpenseCategories();
  const { profile } = useProfile();

  const language = (profile?.language ?? i18n.language ?? 'hr') as Language;
  const currency = profile?.default_currency ?? 'EUR';

  const categoryMap = useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    [categories],
  );

  const propertyMap = useMemo(
    () => new Map(properties.map((property) => [property.id, property])),
    [properties],
  );

  const propertyOptions: PickerOption[] = useMemo(
    () => [
      { label: t('common.all'), value: 'all' },
      ...properties.map((property) => ({ label: property.name, value: property.id })),
    ],
    [properties, t],
  );

  const categoryOptions: PickerOption[] = useMemo(
    () => [
      { label: t('common.all'), value: 'all' },
      ...categories.map((category) => ({
        label: t(`categories.${category.key}`),
        value: category.id,
      })),
    ],
    [categories, t],
  );

  const filteredExpenses = useMemo(() => {
    const query = search.trim().toLowerCase();
    return expenses.filter((expense) => {
      if (recurringFilter === 'recurring' && !expense.is_recurring) return false;
      if (recurringFilter === 'one_time' && expense.is_recurring) return false;
      if (typeFilter !== 'all') {
        const categoryType = categoryMap.get(expense.category_id)?.type;
        if (categoryType !== typeFilter) return false;
      }
      if (categoryFilter !== 'all' && expense.category_id !== categoryFilter) return false;
      if (!query) return true;

      const category = categoryMap.get(expense.category_id);
      const property = propertyMap.get(expense.property_id);
      const categoryLabel = category ? t(`categories.${category.key}`) : '';
      return (
        categoryLabel.toLowerCase().includes(query) ||
        property?.name.toLowerCase().includes(query) ||
        expense.notes?.toLowerCase().includes(query)
      );
    });
  }, [categoryFilter, categoryMap, expenses, propertyMap, recurringFilter, search, t, typeFilter]);

  const sections = useMemo(() => {
    const grouped = new Map<string, ExpenseSection>();

    for (const expense of filteredExpenses) {
      const date = parseISO(expense.billing_date);
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      const key = `${year}-${month}`;
      const title = formatPeriod(month, year, language);

      const section = grouped.get(key) ?? {
        title,
        month,
        year,
        total: 0,
        data: [],
      };

      section.data.push(expense);
      section.total += Number(expense.amount);
      grouped.set(key, section);
    }

    return [...grouped.values()].sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });
  }, [filteredExpenses, language]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleMarkPaid = useCallback(
    (id: string) => {
      showConfirmDialog({
        title: t('confirm.markPaidTitle'),
        message: t('confirm.markPaidMessage'),
        confirmLabel: 'expenses.markPaid',
        onConfirm: async () => {
          try {
            await markAsPaid(id);
            showToast({ message: t('expenses.markedPaid'), type: 'success' });
          } catch (err) {
            showToast({
              message: err instanceof Error ? err.message : t('expenses.markPaidFailed'),
              type: 'error',
            });
          }
        },
      });
    },
    [markAsPaid, showConfirmDialog, showToast, t],
  );

  const handleDelete = useCallback(
    (id: string) => {
      showConfirmDialog({
        title: t('confirm.deleteExpenseTitle'),
        message: t('confirm.deleteExpenseMessage'),
        confirmLabel: 'common.delete',
        destructive: true,
        onConfirm: async () => {
          try {
            await remove(id);
            showToast({ message: t('expenses.deleteSuccess'), type: 'success' });
          } catch (err) {
            showToast({
              message: err instanceof Error ? err.message : t('expenses.deleteFailed'),
              type: 'error',
            });
          }
        },
      });
    },
    [remove, showConfirmDialog, showToast, t],
  );

  const renderExpenseItem = useCallback(
    ({ item }: { item: Expense }) => (
      <View style={styles.itemWrap}>
        <ExpenseCard
          expense={item}
          category={categoryMap.get(item.category_id)}
          propertyName={propertyMap.get(item.property_id)?.name}
          currency={currency}
          language={language}
          onPress={() => router.push(`/expense/${item.id}`)}
          onMarkPaid={!item.paid_at ? () => handleMarkPaid(item.id) : undefined}
          onDelete={() => handleDelete(item.id)}
        />
      </View>
    ),
    [categoryMap, currency, handleDelete, handleMarkPaid, language, propertyMap],
  );

  if (isLoading && expenses.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <SkeletonLoader count={6} height={120} style={styles.skeleton} />
      </View>
    );
  }

  if (error && expenses.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ErrorState message={error} onRetry={refetch} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled
        contentContainerStyle={[
          sections.length === 0 && styles.listEmpty,
          { paddingBottom: insets.bottom + 88 },
        ]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={
          <View style={styles.filters}>
            <AppTextInput
              placeholder={t('expenses.searchPlaceholder')}
              value={search}
              onChangeText={setSearch}
            />
            <AppSegmentedControl
              segments={[
                { label: t('expenses.filterAll'), value: 'all' },
                { label: t('expenses.filterUnpaid'), value: 'unpaid' },
                { label: t('expenses.filterPaid'), value: 'paid' },
                { label: t('expenses.overdue'), value: 'overdue' },
              ]}
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as StatusFilter)}
            />
            <AppSegmentedControl
              segments={[
                { label: t('common.all'), value: 'all' },
                { label: t('expenses.filterRecurring'), value: 'recurring' },
                { label: t('expenses.filterOneTime'), value: 'one_time' },
              ]}
              value={recurringFilter}
              onValueChange={(value) => setRecurringFilter(value as RecurringFilter)}
            />
            <AppSegmentedControl
              segments={[
                { label: t('common.all'), value: 'all' },
                { label: t('expenses.filterRegular'), value: 'regular' },
                { label: t('expenses.filterIrregular'), value: 'irregular' },
              ]}
              value={typeFilter}
              onValueChange={(value) => setTypeFilter(value as TypeFilter)}
            />
            <AppPicker
              label={t('expenses.filterByProperty')}
              options={propertyOptions}
              value={propertyFilter}
              onValueChange={setPropertyFilter}
            />
            <AppPicker
              label={t('expenses.filterByCategory')}
              options={categoryOptions}
              value={categoryFilter}
              onValueChange={setCategoryFilter}
            />
          </View>
        }
        renderSectionHeader={({ section }) => (
          <View
            style={[
              styles.sectionHeader,
              { backgroundColor: theme.colors.background },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              {section.title}
            </Text>
            <Text style={[styles.sectionTotal, { color: theme.colors.onSurfaceVariant }]}>
              {t('expenses.monthTotal', {
                period: format(new Date(section.year, section.month - 1), 'MMMM yyyy'),
              })}
              {' · '}
              {section.total.toFixed(2)} {currency}
            </Text>
          </View>
        )}
        renderItem={renderExpenseItem}
        ListEmptyComponent={
          <EmptyState
            icon={Receipt}
            title={t('empty.noExpenses')}
            subtitle={
              search ||
              statusFilter !== 'all' ||
              recurringFilter !== 'all' ||
              typeFilter !== 'all' ||
              propertyFilter !== 'all' ||
              categoryFilter !== 'all'
                ? t('empty.noResultsHint')
                : t('empty.noExpensesHint')
            }
            ctaLabel={t('expenses.addNew')}
            onCtaPress={() => router.push('/expense/new')}
          />
        }
      />

      <AppFab
        style={[styles.fab, { bottom: insets.bottom + 16 }]}
        onPress={() => router.push('/expense/new')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skeleton: {
    padding: Spacing.md,
  },
  filters: {
    gap: Spacing.sm,
    padding: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  listEmpty: {
    flexGrow: 1,
  },
  sectionHeader: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.titleMedium,
  },
  sectionTotal: {
    ...Typography.bodySmall,
    marginTop: 2,
  },
  itemWrap: {
    paddingHorizontal: Spacing.md,
  },
  fab: {
    position: 'absolute',
    right: 16,
  },
});
