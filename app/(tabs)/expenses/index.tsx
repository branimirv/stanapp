import { router, useLocalSearchParams } from 'expo-router';
import { parseISO, format as formatDateFns } from 'date-fns';
import { Plus, Receipt, Search } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
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
import { APP_BOTTOM_SHEET_CLOSE_MS } from '@/components/ui/AppBottomSheet';
import { AppExpandableSearch } from '@/components/ui/AppExpandableSearch';
import type { PickerOption } from '@/components/ui/AppPicker';
import { BlurOverlay } from '@/components/ui/BlurOverlay';
import { DisplayAmount } from '@/components/ui/DisplayAmount';
import { ErrorState } from '@/components/ui/ErrorState';
import { FilterIconButton } from '@/components/ui/FilterIconButton';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { Spacing, Typography } from '@/constants/theme';
import { useExpenseCategories } from '@/hooks/useExpenseCategories';
import { useExpenses } from '@/hooks/useExpenses';
import { useExpandableSearchState } from '@/hooks/useExpandableSearch';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useProfile } from '@/hooks/useProfile';
import { useProperties } from '@/hooks/useProperties';
import { displayFontFamily, Fonts } from '@/lib/fonts';
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
  const { colors, elevation, radius } = theme;
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
      <View style={styles.container} className="bg-transparent">
        <SkeletonLoader count={6} height={120} style={styles.skeleton} />
      </View>
    );
  }

  if (error && expenses.length === 0) {
    return (
      <View style={styles.container} className="bg-transparent">
        <ErrorState message={error} onRetry={refetch} />
      </View>
    );
  }

  return (
    <View style={styles.container} className="bg-transparent" collapsable={false}>
      <ScrollView
        style={styles.list}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={[
          styles.listContent,
          {
            paddingHorizontal: theme.spacing.gutter,
            paddingTop: 0,
            paddingBottom: Spacing.scrollBottom,
          },
          filteredExpenses.length === 0 && styles.listEmpty,
        ]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.topRow}>
          {hasAnyExpenses ? (
            <FilterIconButton
              activeCount={activeFilterCount}
              onPress={handleFilterPress}
              accessibilityLabel={
                activeFilterCount > 0
                  ? t('expenses.filtersWithCount', { count: activeFilterCount })
                  : t('expenses.filters')
              }
            />
          ) : (
            <View style={styles.topSpacer} />
          )}
          <View style={styles.actions}>
            <Pressable
              onPress={handleSearchPress}
              accessibilityRole="button"
              accessibilityLabel={t('common.search')}
              style={[
                styles.btnIco,
                {
                  backgroundColor:
                    searchHasText || searchExpanded
                      ? colors.primaryTint
                      : colors.surface2,
                },
              ]}
              hitSlop={4}
            >
              <Search
                size={17}
                color={searchHasText || searchExpanded ? colors.primary : colors.fg}
                strokeWidth={2}
              />
            </Pressable>
            <Pressable
              onPress={handleCreatePress}
              accessibilityRole="button"
              accessibilityLabel={t('expenses.addNew')}
              style={[styles.btnIco, { backgroundColor: colors.surface2 }]}
              hitSlop={4}
            >
              <Plus size={17} color={colors.fg} strokeWidth={2} />
            </Pressable>
          </View>
        </View>

        <View style={styles.titleBlk}>
          <Text
            style={{
              fontFamily: Fonts.sans.semibold,
              fontSize: 11,
              lineHeight: 14,
              letterSpacing: 1.54,
              textTransform: 'uppercase',
              color: colors.muted,
              marginBottom: 10,
            }}
          >
            {eyebrowText}
          </Text>
          <Text
            style={{
              fontFamily: displayFontFamily(theme.name),
              fontSize: 34,
              lineHeight: 34,
              letterSpacing: -0.85,
              color: colors.fg,
            }}
          >
            {t('expenses.title')}
          </Text>
        </View>

        <AppExpandableSearch
          {...searchBarControlProps}
          placeholder={t('expenses.searchPlaceholder')}
          style={styles.searchBar}
        />

        {hasAnyExpenses ? (
          <>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.pillBleed}
              contentContainerStyle={[styles.pillRow, { paddingHorizontal: theme.spacing.gutter }]}
            >
              <Pressable
                onPress={() => handlePropertyPill('all')}
                style={[
                  styles.pill,
                  {
                    backgroundColor:
                      propertyFilter === 'all' ? colors.primaryTint : colors.surface2,
                  },
                ]}
                accessibilityRole="button"
                accessibilityState={{ selected: propertyFilter === 'all' }}
              >
                <Text
                  style={{
                    fontFamily: Fonts.sans.semibold,
                    fontSize: 13,
                    color: propertyFilter === 'all' ? colors.primary : colors.muted,
                  }}
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
                    style={[
                      styles.pill,
                      {
                        backgroundColor: on ? colors.primaryTint : colors.surface2,
                      },
                    ]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: on }}
                  >
                    <Text
                      style={{
                        fontFamily: Fonts.sans.semibold,
                        fontSize: 13,
                        color: on ? colors.primary : colors.muted,
                      }}
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
          style={[
            styles.bays,
            isEmptyList ? styles.baysBeforeEmpty : null,
            {
              backgroundColor: colors.surface,
              borderColor: colors.cardBd,
              borderRadius: radius.xl,
              ...elevation.card,
            },
          ]}
        >
          <View style={styles.bay}>
            <Text
              style={{
                fontFamily: Fonts.sans.semibold,
                fontSize: 10,
                letterSpacing: 0.8,
                textTransform: 'uppercase',
                color: colors.muted,
                marginBottom: 9,
              }}
            >
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
          <View style={[styles.bayDivider, { backgroundColor: colors.bd }]} />
          <View style={styles.bay}>
            <Text
              style={{
                fontFamily: Fonts.sans.semibold,
                fontSize: 10,
                letterSpacing: 0.8,
                textTransform: 'uppercase',
                color: colors.muted,
                marginBottom: 9,
              }}
            >
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
            <View
              style={[
                styles.emptyCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.cardBd,
                  borderRadius: radius.xl,
                  ...elevation.card,
                },
              ]}
            >
              <View style={[styles.emptyIc, { backgroundColor: colors.primaryTint }]}>
                <Receipt size={25} color={colors.primary} strokeWidth={2} />
              </View>
              <Text
                style={{
                  fontFamily: displayFontFamily(theme.name),
                  fontSize: 23,
                  letterSpacing: -0.46,
                  color: colors.fg,
                  textAlign: 'center',
                  marginBottom: 8,
                }}
              >
                {search || activeFilterCount > 0
                  ? t('empty.noResults')
                  : t('empty.noExpenses')}
              </Text>
              <Text
                style={{
                  fontFamily: Fonts.sans.regular,
                  fontSize: 12.5,
                  lineHeight: 20,
                  color: colors.muted,
                  textAlign: 'center',
                  maxWidth: 210,
                  marginBottom: 22,
                }}
              >
                {search || activeFilterCount > 0
                  ? t('empty.noResultsHint')
                  : t('empty.noExpensesHint')}
              </Text>
              {!search && activeFilterCount === 0 ? (
                <Pressable
                  onPress={handleCreatePress}
                  accessibilityRole="button"
                  accessibilityLabel={t('expenses.addNew')}
                  style={[styles.emptyCta, { backgroundColor: colors.primary }]}
                >
                  <Plus size={18} color={colors.onPrimary} strokeWidth={2} />
                  <Text
                    style={{
                      fontFamily: Fonts.sans.semibold,
                      fontSize: 14,
                      letterSpacing: -0.14,
                      color: colors.onPrimary,
                    }}
                  >
                    {t('expenses.addNew')}
                  </Text>
                </Pressable>
              ) : null}
            </View>
            {lastExpenseShortDate ? (
              <Text
                style={{
                  fontFamily: Fonts.sans.semibold,
                  fontSize: 10,
                  letterSpacing: 0.8,
                  textTransform: 'uppercase',
                  color: colors.muted,
                  textAlign: 'center',
                  marginTop: 24,
                }}
              >
                {t('expenses.lastExpenseRecorded', { date: lastExpenseShortDate })}
              </Text>
            ) : null}
          </>
        ) : (
          <>
            <View
              style={[
                styles.card,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.cardBd,
                  borderRadius: radius.xl,
                  ...elevation.card,
                },
              ]}
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
                style={styles.footerTap}
              >
                <Text
                  style={{
                    fontFamily: Fonts.sans.semibold,
                    fontSize: 10,
                    letterSpacing: 0.8,
                    textTransform: 'uppercase',
                    color: colors.muted,
                    textAlign: 'center',
                  }}
                >
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
              <Text
                style={{
                  fontFamily: Fonts.sans.semibold,
                  fontSize: 10,
                  letterSpacing: 0.8,
                  textTransform: 'uppercase',
                  color: colors.muted,
                  textAlign: 'center',
                  marginTop: 14,
                }}
              >
                {t('properties.showingOf', {
                  shown: filteredExpenses.length,
                  total: filteredExpenses.length,
                })}
              </Text>
            )}
          </>
        )}
      </ScrollView>

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
  },
  listEmpty: {
    flexGrow: 1,
  },
  skeleton: {
    padding: Spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  topSpacer: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  btnIco: {
    width: 38,
    height: 38,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBlk: {
    marginBottom: 14,
  },
  searchBar: {
    marginBottom: 8,
  },
  pillBleed: {
    flexGrow: 0,
    marginHorizontal: -Spacing.gutter,
    marginBottom: 10,
  },
  pillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pill: {
    height: 34,
    paddingHorizontal: 14,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 180,
  },
  bays: {
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: 14,
    borderWidth: 1,
  },
  baysBeforeEmpty: {
    marginBottom: 26,
  },
  bay: {
    flex: 1,
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 15,
  },
  bayDivider: {
    width: 1,
    alignSelf: 'stretch',
  },
  card: {
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingTop: 4,
    paddingBottom: 6,
    marginBottom: 10,
  },
  footerTap: {
    marginTop: 6,
    marginBottom: 8,
    paddingVertical: 8,
  },
  emptyCard: {
    paddingTop: 38,
    paddingHorizontal: 20,
    paddingBottom: 34,
    alignItems: 'center',
    borderWidth: 1,
  },
  emptyIc: {
    width: 60,
    height: 60,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyCta: {
    height: 44,
    paddingHorizontal: 18,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
