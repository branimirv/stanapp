import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { CategoryBadge } from '@/components/expense/CategoryBadge';
import type {
  RecurringFilter,
  StatusFilter,
  TypeFilter,
} from '@/components/expense/expenseFilterTypes';
import {
  buildExpensePeriod,
  type ExpensePeriod,
  type ExpensePeriodPreset,
} from '@/components/expense/expensePeriod';
import { AppBottomSheet } from '@/components/ui/AppBottomSheet';
import { AppDatePicker } from '@/components/ui/AppDatePicker';
import { AppFilterSheetFooter } from '@/components/ui/AppFilterSheetFooter';
import type { PickerOption } from '@/components/ui/AppPicker';
import { FilterGroup } from '@/components/ui/FilterGroup';
import {
  FilterOptionChipRow,
  type FilterOptionChip,
} from '@/components/ui/FilterOptionChipRow';
import { useExpenseCategories } from '@/hooks/useExpenseCategories';
import { useAppTheme } from '@/hooks/useAppTheme';
import { cn } from '@/lib/utils';
import { getCategoryLabel } from '@/utils/expense';
import { formatDateOnly } from '@/utils/formatters';

export interface ExpenseFiltersSheetProps {
  visible: boolean;
  onDismiss: () => void;
  statusFilter: StatusFilter;
  onStatusFilterChange: (value: StatusFilter) => void;
  propertyFilter: string;
  onPropertyFilterChange: (value: string) => void;
  categoryFilter: string[];
  onCategoryFilterChange: (value: string[]) => void;
  propertyOptions: PickerOption[];
  categoryOptions: PickerOption[];
  recurringFilter: RecurringFilter;
  onRecurringFilterChange: (value: RecurringFilter) => void;
  typeFilter: TypeFilter;
  onTypeFilterChange: (value: TypeFilter) => void;
  period: ExpensePeriod;
  onPeriodChange: (value: ExpensePeriod) => void;
  onClearFilters: () => void;
}

function parseDateValue(value: string): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function ExpenseFiltersSheet({
  visible,
  onDismiss,
  statusFilter,
  onStatusFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  categoryOptions: _categoryOptions,
  recurringFilter,
  onRecurringFilterChange,
  typeFilter,
  onTypeFilterChange,
  period,
  onPeriodChange,
  onClearFilters,
}: ExpenseFiltersSheetProps) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const { colors } = theme;
  const { categories } = useExpenseCategories();
  const [customStart, setCustomStart] = useState(period.startDate);
  const [customEnd, setCustomEnd] = useState(period.endDate);

  useEffect(() => {
    if (period.preset !== 'custom') return;
    setCustomStart(period.startDate);
    setCustomEnd(period.endDate);
  }, [period.preset, period.startDate, period.endDate]);

  const activeCount = useMemo(() => {
    let count = 0;
    if (statusFilter !== 'all') count += 1;
    if (recurringFilter !== 'all') count += 1;
    if (typeFilter !== 'all') count += 1;
    if (categoryFilter.length > 0) count += 1;
    if (period.preset !== 'current_month') count += 1;
    return count;
  }, [categoryFilter, period.preset, recurringFilter, statusFilter, typeFilter]);

  const statusOptions: FilterOptionChip<StatusFilter>[] = [
    { label: t('expenses.filterAll'), value: 'all' },
    { label: t('expenses.filterUnpaid'), value: 'unpaid' },
    { label: t('expenses.filterPaid'), value: 'paid' },
    { label: t('expenses.overdue'), value: 'overdue' },
  ];

  const recurringOptions: FilterOptionChip<RecurringFilter>[] = [
    { label: t('common.all'), value: 'all' },
    { label: t('expenses.filterRecurring'), value: 'recurring' },
    { label: t('expenses.filterOneTime'), value: 'one_time' },
  ];

  const typeOptions: FilterOptionChip<TypeFilter>[] = [
    { label: t('common.all'), value: 'all' },
    { label: t('expenses.filterRegular'), value: 'regular' },
    { label: t('expenses.filterIrregular'), value: 'irregular' },
  ];

  const periodOptions: FilterOptionChip<ExpensePeriodPreset>[] = [
    { label: t('reports.periodThisMonth'), value: 'current_month' },
    { label: t('reports.last3Months'), value: 'last_3_months' },
    { label: t('expenses.periodThisYear'), value: 'current_year' },
    { label: t('reports.periodCustom'), value: 'custom' },
  ];

  const handlePeriodChange = (preset: ExpensePeriodPreset) => {
    if (preset === 'custom') {
      const next = buildExpensePeriod('custom', period.startDate, period.endDate);
      setCustomStart(next.startDate);
      setCustomEnd(next.endDate);
      onPeriodChange(next);
      return;
    }
    onPeriodChange(buildExpensePeriod(preset));
  };

  const handleCustomStartChange = (date: Date | null) => {
    if (!date) return;
    const nextStart = formatDateOnly(date);
    let nextEnd = customEnd;
    if (!nextEnd || nextEnd < nextStart) nextEnd = nextStart;
    setCustomStart(nextStart);
    setCustomEnd(nextEnd);
    onPeriodChange(buildExpensePeriod('custom', nextStart, nextEnd));
  };

  const handleCustomEndChange = (date: Date | null) => {
    if (!date) return;
    const nextEnd = formatDateOnly(date);
    let nextStart = customStart;
    if (!nextStart || nextEnd < nextStart) nextStart = nextEnd;
    setCustomStart(nextStart);
    setCustomEnd(nextEnd);
    onPeriodChange(buildExpensePeriod('custom', nextStart, nextEnd));
  };

  const handleClear = () => {
    onClearFilters();
    onDismiss();
  };

  const allCategoriesSelected = categoryFilter.length === 0;

  const handleToggleCategory = (categoryId: string) => {
    if (categoryFilter.includes(categoryId)) {
      onCategoryFilterChange(categoryFilter.filter((id) => id !== categoryId));
      return;
    }
    onCategoryFilterChange([...categoryFilter, categoryId]);
  };

  const doneLabel =
    activeCount > 0 ? `${t('common.done')} ${activeCount}` : t('common.done');

  return (
    <AppBottomSheet
      visible={visible}
      onDismiss={onDismiss}
      title={t('expenses.filters')}
    >
      <ScrollView
        className="max-h-105 grow-0"
        contentContainerClassName="pb-2"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        <FilterGroup label={t('common.status')}>
          <FilterOptionChipRow
            options={statusOptions}
            value={statusFilter}
            onChange={onStatusFilterChange}
          />
        </FilterGroup>

        <FilterGroup label={t('expenses.category')}>
          <View className="flex-row flex-wrap gap-2">
            <Pressable
              onPress={() => onCategoryFilterChange([])}
              className={cn(
                'shrink-0 rounded-full border-[1.5px]',
                allCategoriesSelected
                  ? 'border-primary bg-primary-tint'
                  : 'border-transparent bg-surface-2',
              )}
              accessibilityRole="button"
              accessibilityState={{ selected: allCategoriesSelected }}
              accessibilityLabel={t('common.all')}
            >
              <Text
                className={cn(
                  'px-1 py-0.5 text-xs font-semibold',
                  allCategoriesSelected ? 'text-primary' : 'text-muted',
                )}
              >
                {t('common.all')}
              </Text>
            </Pressable>

            {categories.map((category) => {
              const selected = categoryFilter.includes(category.id);
              return (
                <Pressable
                  key={category.id}
                  onPress={() => handleToggleCategory(category.id)}
                  className={cn(
                    'shrink-0 rounded-full border-[1.5px]',
                    selected ? 'border-primary bg-primary-tint' : 'border-transparent',
                  )}
                  style={
                    selected ? undefined : { backgroundColor: `${category.color}22` }
                  }
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={getCategoryLabel(category, t)}
                >
                  <CategoryBadge
                    categoryKey={category.key}
                    categoryName={category.name}
                    icon={category.icon}
                    color={selected ? colors.primary : category.color}
                    style={{ backgroundColor: 'transparent' }}
                  />
                </Pressable>
              );
            })}
          </View>
        </FilterGroup>

        <FilterGroup label={t('expenses.frequency')}>
          <FilterOptionChipRow
            options={recurringOptions}
            value={recurringFilter}
            onChange={onRecurringFilterChange}
          />
        </FilterGroup>

        <FilterGroup label={t('expenses.expenseType')}>
          <FilterOptionChipRow
            options={typeOptions}
            value={typeFilter}
            onChange={onTypeFilterChange}
          />
        </FilterGroup>

        <FilterGroup label={t('expenses.period')} className="mb-6">
          <FilterOptionChipRow
            options={periodOptions}
            value={period.preset}
            onChange={handlePeriodChange}
          />
          {period.preset === 'custom' ? (
            <View className="mt-3 flex-row gap-2.5">
              <AppDatePicker
                label={t('common.from')}
                value={parseDateValue(customStart)}
                onChange={handleCustomStartChange}
                maximumDate={parseDateValue(customEnd) ?? undefined}
                style={{ flex: 1 }}
              />
              <AppDatePicker
                label={t('common.to')}
                value={parseDateValue(customEnd)}
                onChange={handleCustomEndChange}
                minimumDate={parseDateValue(customStart) ?? undefined}
                style={{ flex: 1 }}
              />
            </View>
          ) : null}
        </FilterGroup>
      </ScrollView>

      <AppFilterSheetFooter
        clearLabel={t('common.clearFilters')}
        doneLabel={doneLabel}
        onClear={handleClear}
        onDone={onDismiss}
      />
    </AppBottomSheet>
  );
}
