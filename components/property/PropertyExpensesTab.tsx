import { format as formatDateFns, parseISO } from 'date-fns';
import { Plus, Receipt } from 'lucide-react-native';
import { memo, useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { ExpenseListCardRow } from '@/components/expense/ExpenseListCardRow';
import { PROPERTY_SCENE_TOP_GAP } from '@/components/property/PropertyTabBar';
import { AppButton } from '@/components/ui/AppButton';
import { DisplayAmount } from '@/components/ui/DisplayAmount';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { listPerformanceProps } from '@/constants/list';
import { Spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useExpenseCategories } from '@/hooks/useExpenseCategories';
import { useExpenses } from '@/hooks/useExpenses';
import { useRefetchOnFocus } from '@/hooks/useRefetchOnFocus';
import { displayFontFamily } from '@/lib/fonts';
import { routes } from '@/lib/routes';
import { cn } from '@/lib/utils';
import type { Expense, Language } from '@/types/app.types';
import { getCurrentMonthRange, isDateInRange } from '@/utils/dateRange';
import { formatPeriod } from '@/utils/formatters';

type PeriodFilter = 'current_month' | 'all';

export interface PropertyExpensesTabProps {
  propertyId: string;
  canManage: boolean;
  currency: string;
  language: Language;
  contentTopInset?: number;
}

function capitalizePeriod(label: string, language: Language): string {
  return label.replace(/^./, (ch) =>
    ch.toLocaleUpperCase(language === 'en' ? 'en' : 'hr'),
  );
}

function PropertyExpensesTabComponent({
  propertyId,
  canManage,
  currency,
  language,
  contentTopInset = 0,
}: PropertyExpensesTabProps) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const { colors } = theme;
  const insets = useSafeAreaInsets();
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('current_month');
  const [refreshing, setRefreshing] = useState(false);

  const { expenses, isLoading, refetch: refetchExpenses } = useExpenses({ propertyId });
  const { categories, refetch: refetchCategories } = useExpenseCategories();

  const refetchAll = useCallback(async () => {
    await Promise.all([refetchExpenses(), refetchCategories()]);
  }, [refetchCategories, refetchExpenses]);

  useRefetchOnFocus(refetchAll);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetchAll();
    setRefreshing(false);
  }, [refetchAll]);

  const handleSelectExpense = useCallback((expenseId: string) => {
    router.push(routes.expense.detail(expenseId));
  }, []);

  const handleAddExpense = useCallback(() => {
    router.push({ pathname: routes.expense.new, params: { propertyId } });
  }, [propertyId]);

  const currentMonthRange = useMemo(() => getCurrentMonthRange(), []);
  const { month, year } = currentMonthRange;

  const categoryMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories],
  );

  const monthExpenses = useMemo(
    () =>
      expenses.filter((expense) =>
        isDateInRange(expense.billing_date, currentMonthRange.start, currentMonthRange.end),
      ),
    [currentMonthRange.end, currentMonthRange.start, expenses],
  );

  const monthExpenseTotal = useMemo(
    () => monthExpenses.reduce((sum, expense) => sum + expense.amount, 0),
    [monthExpenses],
  );

  const listTopPad = (contentTopInset || 0) + PROPERTY_SCENE_TOP_GAP;
  const ctaBottom = Math.max(insets.bottom, 12) + 10;

  const sortedAll = useMemo(() => {
    return [...expenses].sort((a, b) => b.billing_date.localeCompare(a.billing_date));
  }, [expenses]);

  const sourceList = periodFilter === 'current_month' ? monthExpenses : sortedAll;
  const isEmptyList = sourceList.length === 0;
  const listBottomPad = canManage && !isEmptyList ? 72 + ctaBottom : Spacing.xxl;

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
  }, []);

  const keyExtractor = useCallback((item: Expense) => item.id, []);

  const renderItem = useCallback(
    ({ item, index }: { item: Expense; index: number }) => (
      <ExpenseListCardRow
        expense={item}
        category={categoryMap.get(item.category_id)}
        currency={currency}
        language={language}
        index={index}
        total={sourceList.length}
        onPress={handleSelectExpense}
      />
    ),
    [categoryMap, currency, handleSelectExpense, language, sourceList.length],
  );

  const listHeader = (
    <>
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

      {!isEmptyList ? (
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
      ) : null}
    </>
  );

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
      <FlatList
        className="flex-1"
        data={sourceList}
        keyExtractor={keyExtractor}
        {...listPerformanceProps}
        contentContainerStyle={{
          paddingHorizontal: Spacing.gutter,
          paddingTop: listTopPad,
          paddingBottom: listBottomPad,
          ...(isEmptyList ? { flexGrow: 1 } : null),
        }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={listHeader}
        renderItem={renderItem}
        ListEmptyComponent={
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
              onCtaPress={canManage ? handleAddExpense : undefined}
            />
            {lastExpenseShortDate ? (
              <Text className="text-muted mt-6 text-center text-[10px] font-semibold tracking-[0.8px] uppercase">
                {t('expenses.lastExpenseRecorded', { date: lastExpenseShortDate })}
              </Text>
            ) : null}
          </>
        }
      />

      {canManage && !isEmptyList ? (
        <View
          pointerEvents="box-none"
          style={[styles.ctaWrap, { paddingBottom: ctaBottom }]}
        >
          <AppButton
            variant="default"
            onPress={handleAddExpense}
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
