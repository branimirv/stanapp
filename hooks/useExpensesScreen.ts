import { format as formatDateFns, parseISO } from 'date-fns';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  countExpenseActiveFilters,
  type ExpenseFiltersStateProps,
  type StatusFilter,
} from '@/components/expense/ExpenseFilters';
import type { RecurringFilter, TypeFilter } from '@/components/expense/expenseFilterTypes';
import {
  buildDefaultExpensePeriod,
  formatExpensePeriodLabel,
  isExpenseInPeriod,
  type ExpensePeriod,
} from '@/components/expense/expensePeriod';
import type { PickerOption } from '@/components/ui/AppPicker';
import { useExpenseCategories } from '@/hooks/useExpenseCategories';
import { useExpenses } from '@/hooks/useExpenses';
import { useExpandableSearchState } from '@/hooks/useExpandableSearch';
import { useProfile } from '@/hooks/useProfile';
import { useProperties } from '@/hooks/useProperties';
import { routes } from '@/lib/routes';
import { useTabBarStore } from '@/stores/tabBarStore';
import type { Language } from '@/types/app.types';
import { getCategoryEffectiveType, getCategoryLabel } from '@/utils/expense';
import { averageExpensesOverMonths, sumExpensesInMonth } from '@/utils/expenseList';

/** Filters, derived lists, and actions for the Troškovi tab. */
export function useExpensesScreen() {
  const { t, i18n } = useTranslation();
  const params = useLocalSearchParams<{ filter?: string }>();
  const setChromeHidden = useTabBarStore((s) => s.setChromeHidden);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [recurringFilter, setRecurringFilter] = useState<RecurringFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [propertyFilter, setPropertyFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [period, setPeriod] = useState<ExpensePeriod>(() => buildDefaultExpensePeriod());
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const {
    search,
    searchHasText,
    searchExpanded,
    handleSearchPress,
    dismissSearchIfEmpty,
    searchBarControlProps,
    listKeyboardProps,
  } = useExpandableSearchState();

  const handleFiltersVisibleChange = useCallback(
    (open: boolean) => {
      setFiltersVisible(open);
      setChromeHidden(open);
    },
    [setChromeHidden],
  );

  useEffect(() => {
    if (params.filter === 'overdue') {
      setStatusFilter('overdue');
    } else if (params.filter === 'unpaid') {
      setStatusFilter('unpaid');
    }
  }, [params.filter]);

  const expenseStatus = statusFilter === 'all' ? undefined : statusFilter;
  const propertyId = propertyFilter === 'all' ? undefined : propertyFilter;

  // Unfiltered list — keeps property pills / filter chrome visible when the
  // active property (or status) filter returns zero rows.
  const { expenses: accountExpenses } = useExpenses();
  const { expenses, isLoading, isFilterRefreshing, error, refetch } = useExpenses({
    status: expenseStatus,
    propertyId,
  });
  const { properties } = useProperties();
  const { categories } = useExpenseCategories();
  const { profile } = useProfile();

  const language = (profile?.language ?? i18n.language ?? 'hr') as Language;
  const currency = profile?.default_currency ?? 'EUR';

  const now = useMemo(() => new Date(), []);
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

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
        label: getCategoryLabel(category, t),
        value: category.id,
      })),
    ],
    [categories, t],
  );

  const activeFilterCount = useMemo(
    () =>
      countExpenseActiveFilters(
        statusFilter,
        recurringFilter,
        typeFilter,
        propertyFilter,
        categoryFilter,
        period,
      ),
    [categoryFilter, period, propertyFilter, recurringFilter, statusFilter, typeFilter],
  );

  const handlePeriodChange = useCallback((next: ExpensePeriod) => {
    setPeriod(next);
  }, []);

  const filterStateProps: ExpenseFiltersStateProps = {
    statusFilter,
    onStatusFilterChange: setStatusFilter,
    recurringFilter,
    onRecurringFilterChange: setRecurringFilter,
    typeFilter,
    onTypeFilterChange: setTypeFilter,
    propertyFilter,
    onPropertyFilterChange: setPropertyFilter,
    categoryFilter,
    onCategoryFilterChange: setCategoryFilter,
    period,
    onPeriodChange: handlePeriodChange,
    propertyOptions,
    categoryOptions,
  };

  const scopedExpenses = useMemo(() => {
    const query = search.trim().toLowerCase();
    return expenses
      .filter((expense) => {
        if (recurringFilter === 'recurring' && !expense.is_recurring) return false;
        if (recurringFilter === 'one_time' && expense.is_recurring) return false;
        if (typeFilter !== 'all') {
          const categoryType = categoryMap.get(expense.category_id);
          if (categoryType && getCategoryEffectiveType(categoryType) !== typeFilter) {
            return false;
          }
        }
        if (categoryFilter.length > 0 && !categoryFilter.includes(expense.category_id)) {
          return false;
        }
        if (!query) return true;

        const category = categoryMap.get(expense.category_id);
        const property = propertyMap.get(expense.property_id);
        const categoryLabel = getCategoryLabel(category, t);
        return (
          categoryLabel.toLowerCase().includes(query) ||
          property?.name.toLowerCase().includes(query) ||
          expense.notes?.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => b.billing_date.localeCompare(a.billing_date));
  }, [categoryFilter, categoryMap, expenses, propertyMap, recurringFilter, search, t, typeFilter]);

  const filteredExpenses = useMemo(
    () => scopedExpenses.filter((expense) => isExpenseInPeriod(expense.billing_date, period)),
    [period, scopedExpenses],
  );

  const thisMonthTotal = useMemo(
    () => sumExpensesInMonth(scopedExpenses, currentMonth, currentYear),
    [currentMonth, currentYear, scopedExpenses],
  );

  const sixMonthAverage = useMemo(
    () => averageExpensesOverMonths(scopedExpenses, currentMonth, currentYear, 6),
    [currentMonth, currentYear, scopedExpenses],
  );

  const hasAnyExpenses = accountExpenses.length > 0;
  const isEmptyList = filteredExpenses.length === 0;
  const isTrueEmpty = !hasAnyExpenses;
  const periodLabel = formatExpensePeriodLabel(period, language, t);
  const scopeLabel =
    propertyFilter === 'all'
      ? t('reports.allProperties')
      : (propertyMap.get(propertyFilter)?.name ?? t('reports.allProperties'));
  const eyebrowText =
    isTrueEmpty || propertyFilter !== 'all'
      ? t('expenses.eyebrowScope', { period: periodLabel, scope: scopeLabel })
      : t('expenses.eyebrow', {
          period: periodLabel,
          count: filteredExpenses.length,
        });

  const lastExpenseShortDate = useMemo(() => {
    if (accountExpenses.length === 0) return null;
    let latest = accountExpenses[0].billing_date;
    for (const expense of accountExpenses) {
      if (expense.billing_date > latest) latest = expense.billing_date;
    }
    return formatDateFns(parseISO(latest), 'dd.MM.');
  }, [accountExpenses]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleCreatePress = useCallback(() => {
    router.push(routes.expense.new);
  }, []);

  const handleExpensePress = useCallback(
    (expenseId: string) => {
      dismissSearchIfEmpty();
      router.push(routes.expense.detail(expenseId));
    },
    [dismissSearchIfEmpty],
  );

  const handleFilterPress = useCallback(() => {
    dismissSearchIfEmpty();
    handleFiltersVisibleChange(true);
  }, [dismissSearchIfEmpty, handleFiltersVisibleChange]);

  const handlePropertyPill = useCallback(
    (value: string) => {
      dismissSearchIfEmpty();
      setPropertyFilter(value);
    },
    [dismissSearchIfEmpty],
  );

  return {
    t,
    search,
    searchHasText,
    searchExpanded,
    handleSearchPress,
    searchBarControlProps,
    listKeyboardProps,
    filtersVisible,
    handleFiltersVisibleChange,
    filterStateProps,
    expenses,
    filteredExpenses,
    isLoading,
    isFilterRefreshing,
    error,
    refetch,
    properties,
    categoryMap,
    propertyMap,
    propertyFilter,
    isPropertyScoped: propertyFilter !== 'all',
    language,
    currency,
    activeFilterCount,
    thisMonthTotal,
    sixMonthAverage,
    hasAnyExpenses,
    isEmptyList,
    eyebrowText,
    lastExpenseShortDate,
    refreshing,
    onRefresh,
    handleCreatePress,
    handleExpensePress,
    handleFilterPress,
    handlePropertyPill,
  };
}
