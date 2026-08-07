import { useCallback } from 'react';
import { FlatList, RefreshControl, Text, View } from 'react-native';

import { ExpenseFiltersSheetHost } from '@/components/expense/ExpenseFilters';
import { ExpenseListCardRow } from '@/components/expense/ExpenseListCardRow';
import { ExpenseListEmpty } from '@/components/expense/ExpenseListEmpty';
import { ExpenseScreenActions } from '@/components/expense/ExpenseScreenActions';
import { ExpenseScreenListHeader } from '@/components/expense/ExpenseScreenListHeader';
import { APP_BOTTOM_SHEET_CLOSE_MS } from '@/components/ui/AppBottomSheet';
import { BlurOverlay } from '@/components/ui/BlurOverlay';
import { ErrorState } from '@/components/ui/ErrorState';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { listPerformanceProps } from '@/constants/list';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useExpensesScreen } from '@/hooks/useExpensesScreen';
import { SearchableTabActions } from '@/hooks/useSearchableTabHeader';
import type { Expense } from '@/types/app.types';

export default function ExpensesScreen() {
  const { theme } = useAppTheme();
  const screen = useExpensesScreen();

  const keyExtractor = useCallback((item: Expense) => item.id, []);

  const renderItem = useCallback(
    ({ item, index }: { item: Expense; index: number }) => (
      <ExpenseListCardRow
        expense={item}
        category={screen.categoryMap.get(item.category_id)}
        propertyName={screen.propertyMap.get(item.property_id)?.name}
        currency={screen.currency}
        language={screen.language}
        index={index}
        total={screen.filteredExpenses.length}
        onPress={screen.handleExpensePress}
      />
    ),
    [
      screen.categoryMap,
      screen.currency,
      screen.filteredExpenses.length,
      screen.handleExpensePress,
      screen.language,
      screen.propertyMap,
    ],
  );

  const listHeader = (
    <ExpenseScreenListHeader
      eyebrowText={screen.eyebrowText}
      searchBarControlProps={screen.searchBarControlProps}
      hasAnyExpenses={screen.hasAnyExpenses}
      properties={screen.properties}
      propertyFilter={screen.propertyFilter}
      onPropertyPill={screen.handlePropertyPill}
      filterStateProps={screen.filterStateProps}
      thisMonthTotal={screen.thisMonthTotal}
      sixMonthAverage={screen.sixMonthAverage}
      currency={screen.currency}
      language={screen.language}
      isEmptyList={screen.isEmptyList}
    />
  );

  const listFooter =
    screen.filteredExpenses.length > 0 ? (
      <Text className="text-muted mt-3.5 text-center text-[10px] font-semibold tracking-[0.8px] uppercase">
        {screen.t('properties.showingOf', {
          shown: screen.filteredExpenses.length,
          total: screen.filteredExpenses.length,
        })}
      </Text>
    ) : null;

  if (screen.isLoading && screen.expenses.length === 0) {
    return (
      <View className="flex-1 bg-transparent">
        <SkeletonLoader count={6} height={120} className="p-4" />
      </View>
    );
  }

  if (screen.error && screen.expenses.length === 0) {
    return (
      <View className="flex-1 bg-transparent">
        <ErrorState message={screen.error} onRetry={screen.refetch} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-transparent" collapsable={false}>
      <FlatList
        className="flex-1"
        contentInsetAdjustmentBehavior="automatic"
        data={screen.filteredExpenses}
        keyExtractor={keyExtractor}
        {...screen.listKeyboardProps}
        {...listPerformanceProps}
        contentContainerStyle={[
          {
            paddingTop: 0,
            paddingHorizontal: theme.spacing.gutter,
            paddingBottom: theme.spacing.scrollBottom,
          },
          screen.isEmptyList ? { flexGrow: 1 } : null,
        ]}
        refreshControl={
          <RefreshControl refreshing={screen.refreshing} onRefresh={screen.onRefresh} />
        }
        ListHeaderComponent={listHeader}
        ListFooterComponent={listFooter}
        renderItem={renderItem}
        ListEmptyComponent={
          <ExpenseListEmpty
            search={screen.search}
            activeFilterCount={screen.activeFilterCount}
            lastExpenseShortDate={screen.lastExpenseShortDate}
            onCreatePress={screen.handleCreatePress}
          />
        }
      />

      {screen.hasAnyExpenses ? (
        <ExpenseScreenActions
          activeFilterCount={screen.activeFilterCount}
          onFilterPress={screen.handleFilterPress}
        />
      ) : null}
      <SearchableTabActions
        showCreate
        onCreatePress={screen.handleCreatePress}
        searchActive={screen.searchHasText}
        searchExpanded={screen.searchExpanded}
        onSearchPress={screen.handleSearchPress}
        createAccessibilityLabel={screen.t('expenses.addNew')}
      />

      <ExpenseFiltersSheetHost
        sheetVisible={screen.filtersVisible}
        onSheetVisibleChange={screen.handleFiltersVisibleChange}
        {...screen.filterStateProps}
      />
      <BlurOverlay
        visible={screen.filtersVisible}
        intensity="strong"
        tint="dark"
        duration={APP_BOTTOM_SHEET_CLOSE_MS}
        zIndex={5}
      />
    </View>
  );
}
