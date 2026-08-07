import { router, useLocalSearchParams } from 'expo-router';
import { parseISO, format as formatDateFns } from 'date-fns';
import { Plus, Receipt } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import { ExpenseListRow } from '@/components/expense/ExpenseListRow';
import {
  countExpenseActiveFilters,
  ExpenseActiveFilterChips,
  ExpenseFiltersSheetHost,
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
import { ExpenseScreenActions } from '@/components/expense/ExpenseScreenActions';
import { APP_BOTTOM_SHEET_CLOSE_MS } from '@/components/ui/AppBottomSheet';
import { AppExpandableSearch } from '@/components/ui/AppExpandableSearch';
import type { PickerOption } from '@/components/ui/AppPicker';
import { BlurOverlay } from '@/components/ui/BlurOverlay';
import { DisplayAmount } from '@/components/ui/DisplayAmount';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { FLOATING_ACTIONS_ROW_HEIGHT } from '@/components/ui/FloatingScreenActions';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { Spacing, Typography } from '@/constants/theme';
import { useExpenseCategories } from '@/hooks/useExpenseCategories';
import { useExpenses } from '@/hooks/useExpenses';
import { useExpandableSearchState } from '@/hooks/useExpandableSearch';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useProfile } from '@/hooks/useProfile';
import { useProperties } from '@/hooks/useProperties';
import { SearchableTabActions } from '@/hooks/useSearchableTabHeader';
import { displayFontFamily } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import { useTabBarStore } from '@/stores/tabBarStore';
import type { Language } from '@/types/app.types';
import { getCategoryEffectiveType, getCategoryLabel } from '@/utils/expense';

const PREVIEW_COUNT = 4;

/** Naslov Troškovi list: inline actions + flat expense rows. */
function isInMonth(billingDate: string, month: number, year: number): boolean {
  const date = parseISO(billingDate);
  return date.getFullYear() === year && date.getMonth() + 1 === month;
}

export default function ExpensesScreen() {
  const { t, i18n } = useTranslation();
  const { theme } = useAppTheme();
  const { colors, elevation } = theme;
  const params = useLocalSearchParams<{ filter?: string }>();

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [recurringFilter, setRecurringFilter] = useState<RecurringFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [propertyFilter, setPropertyFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [period, setPeriod] = useState<ExpensePeriod>(() => buildDefaultExpensePeriod());
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const setChromeHidden = useTabBarStore((s) => s.setChromeHidden);

  const handleCreatePress = useCallback(() => {
    router.push('/expense/new');
  }, []);

  const {
    search,
    searchHasText,
    searchExpanded,
    handleSearchPress,
    dismissSearchIfEmpty,
    searchBarControlProps,
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

  const { expenses, isLoading, error, refetch } = useExpenses({
    status: expenseStatus,
    propertyId,
  });
  const { properties } = useProperties();
  const { categories } = useExpenseCategories();
  const { profile } = useProfile();

  const language = (profile?.language ?? i18n.language ?? 'hr') as Language;
  const currency = profile?.default_currency ?? 'EUR';

  const now = new Date();
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
    setExpanded(false);
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
        if (
          categoryFilter.length > 0 &&
          !categoryFilter.includes(expense.category_id)
        ) {
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
    () =>
      scopedExpenses
        .filter((expense) => isInMonth(expense.billing_date, currentMonth, currentYear))
        .reduce((sum, expense) => sum + Number(expense.amount), 0),
    [currentMonth, currentYear, scopedExpenses],
  );

  const sixMonthAverage = useMemo(() => {
    const monthTotals: number[] = [];
    for (let offset = 0; offset < 6; offset += 1) {
      const date = new Date(currentYear, currentMonth - 1 - offset, 1);
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      const total = scopedExpenses
        .filter((expense) => isInMonth(expense.billing_date, month, year))
        .reduce((sum, expense) => sum + Number(expense.amount), 0);
      monthTotals.push(total);
    }
    return monthTotals.reduce((sum, value) => sum + value, 0) / 6;
  }, [currentMonth, currentYear, scopedExpenses]);

  const visibleExpenses = useMemo(() => {
    if (expanded || filteredExpenses.length <= PREVIEW_COUNT) return filteredExpenses;
    return filteredExpenses.slice(0, PREVIEW_COUNT);
  }, [expanded, filteredExpenses]);

  const hasMore = filteredExpenses.length > PREVIEW_COUNT;
  const hasAnyExpenses = expenses.length > 0;
  const isEmptyList = filteredExpenses.length === 0;
  const isTrueEmpty = !hasAnyExpenses;
  const periodLabel = formatExpensePeriodLabel(period, language, t);
  const scopeLabel =
    propertyFilter === 'all'
      ? t('reports.allProperties')
      : (propertyMap.get(propertyFilter)?.name ?? t('reports.allProperties'));
  const eyebrowText = isTrueEmpty
    ? t('expenses.eyebrowScope', { period: periodLabel, scope: scopeLabel })
    : t('expenses.eyebrow', {
        period: periodLabel,
        count: filteredExpenses.length,
      });

  const lastExpenseShortDate = useMemo(() => {
    if (expenses.length === 0) return null;
    let latest = expenses[0].billing_date;
    for (const expense of expenses) {
      if (expense.billing_date > latest) latest = expense.billing_date;
    }
    return formatDateFns(parseISO(latest), 'dd.MM.');
  }, [expenses]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleExpensePress = useCallback(
    (expenseId: string) => {
      dismissSearchIfEmpty();
      router.push(`/expense/${expenseId}`);
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
      setExpanded(false);
    },
    [dismissSearchIfEmpty],
  );

  if (isLoading && expenses.length === 0) {
    return (
      <View className="flex-1 bg-transparent">
        <SkeletonLoader count={6} height={120} className="p-4" />
      </View>
    );
  }

  if (error && expenses.length === 0) {
    return (
      <View className="flex-1 bg-transparent">
        <ErrorState message={error} onRetry={refetch} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-transparent" collapsable={false}>
      <ScrollView
        className="flex-1"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={[
          {
            flexGrow: 1,
            paddingHorizontal: theme.spacing.gutter,
            paddingTop: 0,
            paddingBottom: Spacing.scrollBottom,
          },
        ]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ height: FLOATING_ACTIONS_ROW_HEIGHT }} />

        <View className="mb-3.5">
          <Text className="text-muted mb-2.5 text-[11px] leading-3.5 font-semibold tracking-[1.54px] uppercase">
            {eyebrowText}
          </Text>
          <Text
            className="text-fg text-[34px] tracking-[-0.85px]"
            style={{
              fontFamily: displayFontFamily(theme.name),
              lineHeight: 34,
            }}
          >
            {t('expenses.title')}
          </Text>
        </View>

        <AppExpandableSearch
          {...searchBarControlProps}
          placeholder={t('expenses.searchPlaceholder')}
          className="mb-2"
        />

        {hasAnyExpenses ? (
          <>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-2.5 grow-0"
              style={{ marginHorizontal: -theme.spacing.gutter }}
              contentContainerClassName="flex-row items-center gap-2"
              contentContainerStyle={{ paddingHorizontal: theme.spacing.gutter }}
            >
              <Pressable
                onPress={() => handlePropertyPill('all')}
                className={cn(
                  'h-8.5 max-w-45 items-center justify-center rounded-full px-3.5',
                  propertyFilter === 'all' ? 'bg-primary-tint' : 'bg-surface-2',
                )}
                accessibilityRole="button"
                accessibilityState={{ selected: propertyFilter === 'all' }}
              >
                <Text
                  className={cn(
                    'text-[13px] font-semibold',
                    propertyFilter === 'all' ? 'text-primary' : 'text-muted',
                  )}
                >
                  {t('reports.allProperties')}
                </Text>
              </Pressable>
              {properties.map((property) => {
                const on = propertyFilter === property.id;
                return (
                  <Pressable
                    key={property.id}
                    onPress={() => handlePropertyPill(property.id)}
                    className={cn(
                      'h-8.5 max-w-45 items-center justify-center rounded-full px-3.5',
                      on ? 'bg-primary-tint' : 'bg-surface-2',
                    )}
                    accessibilityRole="button"
                    accessibilityState={{ selected: on }}
                  >
                    <Text
                      className={cn('text-[13px] font-semibold', on ? 'text-primary' : 'text-muted')}
                      numberOfLines={1}
                    >
                      {property.name}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <ExpenseActiveFilterChips {...filterStateProps} />
          </>
        ) : null}

        <View
          className={cn(
            'border-card-bd bg-surface flex-row overflow-hidden rounded-xl border',
            isEmptyList ? 'mb-6.5' : 'mb-3.5',
          )}
          style={elevation.card}
        >
          <View className="flex-1 px-4 pt-4 pb-3.75">
            <Text className="text-muted mb-2.25 text-[10px] font-semibold tracking-[0.8px] uppercase">
              {t('expenses.thisMonthBay')}
            </Text>
            <DisplayAmount
              amount={thisMonthTotal}
              currency={currency}
              language={language}
              size={Typography.display.amountSm.size}
              lineHeight={Typography.display.amountSm.lineHeight}
              letterSpacing={Typography.display.amountSm.letterSpacing}
            />
          </View>
          <View className="bg-bd w-px self-stretch" />
          <View className="flex-1 px-4 pt-4 pb-3.75">
            <Text className="text-muted mb-2.25 text-[10px] font-semibold tracking-[0.8px] uppercase">
              {t('expenses.avgSixMonthsBay')}
            </Text>
            <DisplayAmount
              amount={sixMonthAverage}
              currency={currency}
              language={language}
              size={Typography.display.amountSm.size}
              lineHeight={Typography.display.amountSm.lineHeight}
              letterSpacing={Typography.display.amountSm.letterSpacing}
              color={colors.muted}
            />
          </View>
        </View>

        {isEmptyList ? (
          <>
            <EmptyState
              icon={Receipt}
              title={
                search || activeFilterCount > 0
                  ? t('empty.noResults')
                  : t('empty.noExpenses')
              }
              subtitle={
                search || activeFilterCount > 0
                  ? t('empty.noResultsHint')
                  : t('empty.noExpensesHint')
              }
              ctaLabel={
                !search && activeFilterCount === 0 ? t('expenses.addNew') : undefined
              }
              ctaIcon={Plus}
              onCtaPress={
                !search && activeFilterCount === 0 ? handleCreatePress : undefined
              }
            />
            {lastExpenseShortDate ? (
              <Text className="text-muted mt-6 text-center text-[10px] font-semibold tracking-[0.8px] uppercase">
                {t('expenses.lastExpenseRecorded', { date: lastExpenseShortDate })}
              </Text>
            ) : null}
          </>
        ) : (
          <>
            <View
              className="border-card-bd bg-surface mb-2.5 rounded-xl border px-4.5 pt-1 pb-1.5"
              style={elevation.card}
            >
              {visibleExpenses.map((expense, index) => (
                <ExpenseListRow
                  key={expense.id}
                  expense={expense}
                  category={categoryMap.get(expense.category_id)}
                  propertyName={propertyMap.get(expense.property_id)?.name}
                  currency={currency}
                  language={language}
                  showDivider={index > 0}
                  onPress={handleExpensePress}
                />
              ))}
            </View>

            {hasMore ? (
              <Pressable
                onPress={() => setExpanded((current) => !current)}
                accessibilityRole="button"
                accessibilityState={{ expanded }}
                hitSlop={8}
                className="mt-1.5 mb-2 py-2"
              >
                <Text className="text-muted text-center text-[10px] font-semibold tracking-[0.8px] uppercase">
                  {expanded
                    ? t('expenses.showingShowLess', {
                        shown: filteredExpenses.length,
                        total: filteredExpenses.length,
                      })
                    : t('expenses.showingLoadMore', {
                        shown: visibleExpenses.length,
                        total: filteredExpenses.length,
                      })}
                </Text>
              </Pressable>
            ) : (
              <Text className="text-muted mt-3.5 text-center text-[10px] font-semibold tracking-[0.8px] uppercase">
                {t('properties.showingOf', {
                  shown: filteredExpenses.length,
                  total: filteredExpenses.length,
                })}
              </Text>
            )}
          </>
        )}
      </ScrollView>

      {hasAnyExpenses ? (
        <ExpenseScreenActions
          activeFilterCount={activeFilterCount}
          onFilterPress={handleFilterPress}
        />
      ) : null}
      <SearchableTabActions
        showCreate
        onCreatePress={handleCreatePress}
        searchActive={searchHasText}
        searchExpanded={searchExpanded}
        onSearchPress={handleSearchPress}
        createAccessibilityLabel={t('expenses.addNew')}
      />

      <ExpenseFiltersSheetHost
        sheetVisible={filtersVisible}
        onSheetVisibleChange={handleFiltersVisibleChange}
        {...filterStateProps}
      />
      <BlurOverlay
        visible={filtersVisible}
        intensity="strong"
        tint="dark"
        duration={APP_BOTTOM_SHEET_CLOSE_MS}
        zIndex={5}
      />
    </View>
  );
}
