import { useMemo } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ExpenseFiltersSheet } from '@/components/expense/ExpenseFiltersSheet';
import type {
  RecurringFilter,
  StatusFilter,
  TypeFilter,
} from '@/components/expense/expenseFilterTypes';
import {
  buildDefaultExpensePeriod,
  formatExpensePeriodLabel,
  type ExpensePeriod,
} from '@/components/expense/expensePeriod';
import type { PickerOption } from '@/components/ui/AppPicker';
import { FilterChipRow, type FilterChip } from '@/components/ui/FilterChipRow';
import { useProfile } from '@/hooks/useProfile';
import type { Language } from '@/types/app.types';

export type { RecurringFilter, StatusFilter, TypeFilter } from '@/components/expense/expenseFilterTypes';

export interface ExpenseFiltersStateProps {
  statusFilter: StatusFilter;
  onStatusFilterChange: (value: StatusFilter) => void;
  recurringFilter: RecurringFilter;
  onRecurringFilterChange: (value: RecurringFilter) => void;
  typeFilter: TypeFilter;
  onTypeFilterChange: (value: TypeFilter) => void;
  propertyFilter: string;
  onPropertyFilterChange: (value: string) => void;
  /** Empty = all categories. */
  categoryFilter: string[];
  onCategoryFilterChange: (value: string[]) => void;
  period: ExpensePeriod;
  onPeriodChange: (value: ExpensePeriod) => void;
  propertyOptions: PickerOption[];
  categoryOptions: PickerOption[];
}

export interface ExpenseFiltersSheetHostProps extends ExpenseFiltersStateProps {
  sheetVisible: boolean;
  onSheetVisibleChange: (visible: boolean) => void;
}

/**
 * Sheet/chip filters only — property is owned by the pill row, so it is not
 * counted here (avoids a duplicate “active” signal next to the pills).
 * Period counts when not the default (current month).
 */
function countActiveFilters(
  statusFilter: StatusFilter,
  recurringFilter: RecurringFilter,
  typeFilter: TypeFilter,
  categoryFilter: string[],
  period: ExpensePeriod,
): number {
  let count = 0;
  if (statusFilter !== 'all') count += 1;
  if (recurringFilter !== 'all') count += 1;
  if (typeFilter !== 'all') count += 1;
  if (categoryFilter.length > 0) count += 1;
  if (period.preset !== 'current_month') count += 1;
  return count;
}

export function countExpenseActiveFilters(
  statusFilter: StatusFilter,
  recurringFilter: RecurringFilter,
  typeFilter: TypeFilter,
  _propertyFilter: string,
  categoryFilter: string[],
  period: ExpensePeriod,
): number {
  return countActiveFilters(
    statusFilter,
    recurringFilter,
    typeFilter,
    categoryFilter,
    period,
  );
}

function useExpenseFilterChips({
  statusFilter,
  onStatusFilterChange,
  recurringFilter,
  onRecurringFilterChange,
  typeFilter,
  onTypeFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  categoryOptions,
  period,
  onPeriodChange,
}: ExpenseFiltersStateProps) {
  const { t, i18n } = useTranslation();
  const { profile } = useProfile();
  const language = (profile?.language ?? i18n.language ?? 'hr') as Language;

  return useMemo(() => {
    const chips: FilterChip[] = [];

    if (statusFilter === 'unpaid') {
      chips.push({
        key: 'unpaid',
        label: t('expenses.filterUnpaid'),
        onClear: () => onStatusFilterChange('all'),
      });
    } else if (statusFilter === 'paid') {
      chips.push({
        key: 'paid',
        label: t('expenses.filterPaid'),
        onClear: () => onStatusFilterChange('all'),
      });
    } else if (statusFilter === 'overdue') {
      chips.push({
        key: 'overdue',
        label: t('expenses.overdue'),
        onClear: () => onStatusFilterChange('all'),
      });
    }

    for (const categoryId of categoryFilter) {
      const label = categoryOptions.find((option) => option.value === categoryId)?.label;
      if (label) {
        chips.push({
          key: `category-${categoryId}`,
          label,
          onClear: () =>
            onCategoryFilterChange(categoryFilter.filter((id) => id !== categoryId)),
        });
      }
    }

    if (recurringFilter === 'recurring') {
      chips.push({
        key: 'recurring',
        label: t('expenses.filterRecurring'),
        onClear: () => onRecurringFilterChange('all'),
      });
    } else if (recurringFilter === 'one_time') {
      chips.push({
        key: 'one_time',
        label: t('expenses.filterOneTime'),
        onClear: () => onRecurringFilterChange('all'),
      });
    }

    if (typeFilter === 'regular') {
      chips.push({
        key: 'regular',
        label: t('expenses.filterRegular'),
        onClear: () => onTypeFilterChange('all'),
      });
    } else if (typeFilter === 'irregular') {
      chips.push({
        key: 'irregular',
        label: t('expenses.filterIrregular'),
        onClear: () => onTypeFilterChange('all'),
      });
    }

    if (period.preset !== 'current_month') {
      chips.push({
        key: 'period',
        label: formatExpensePeriodLabel(period, language, t),
        onClear: () => onPeriodChange(buildDefaultExpensePeriod()),
      });
    }

    return chips;
  }, [
    categoryFilter,
    categoryOptions,
    language,
    onCategoryFilterChange,
    onPeriodChange,
    onRecurringFilterChange,
    onStatusFilterChange,
    onTypeFilterChange,
    period,
    recurringFilter,
    statusFilter,
    t,
    typeFilter,
  ]);
}

/** Active filter chips shown under property pills (Naslov `.fchip` row). */
export function ExpenseActiveFilterChips(props: ExpenseFiltersStateProps) {
  const chips = useExpenseFilterChips(props);
  if (chips.length === 0) return null;

  return (
    <View className="mb-4">
      <FilterChipRow chips={chips} />
    </View>
  );
}

/** Filter sheet host kept outside scroll/list trees. */
export function ExpenseFiltersSheetHost({
  sheetVisible,
  onSheetVisibleChange,
  statusFilter,
  onStatusFilterChange,
  recurringFilter,
  onRecurringFilterChange,
  typeFilter,
  onTypeFilterChange,
  propertyFilter,
  onPropertyFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  period,
  onPeriodChange,
  propertyOptions,
  categoryOptions,
}: ExpenseFiltersSheetHostProps) {
  const handleClearFilters = () => {
    onStatusFilterChange('all');
    onRecurringFilterChange('all');
    onTypeFilterChange('all');
    onPropertyFilterChange('all');
    onCategoryFilterChange([]);
    onPeriodChange(buildDefaultExpensePeriod());
  };

  return (
    <ExpenseFiltersSheet
      visible={sheetVisible}
      onDismiss={() => onSheetVisibleChange(false)}
      statusFilter={statusFilter}
      onStatusFilterChange={onStatusFilterChange}
      propertyFilter={propertyFilter}
      onPropertyFilterChange={onPropertyFilterChange}
      categoryFilter={categoryFilter}
      onCategoryFilterChange={onCategoryFilterChange}
      propertyOptions={propertyOptions}
      categoryOptions={categoryOptions}
      recurringFilter={recurringFilter}
      onRecurringFilterChange={onRecurringFilterChange}
      typeFilter={typeFilter}
      onTypeFilterChange={onTypeFilterChange}
      period={period}
      onPeriodChange={onPeriodChange}
      onClearFilters={handleClearFilters}
    />
  );
}
