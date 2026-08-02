import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ExpenseFiltersSheet } from '@/components/expense/ExpenseFiltersSheet';
import type {
  RecurringFilter,
  StatusFilter,
  TypeFilter,
} from '@/components/expense/expenseFilterTypes';
import type { PickerOption } from '@/components/ui/AppPicker';
import { FilterChipRow, type FilterChip } from '@/components/ui/FilterChipRow';
import { Spacing } from '@/constants/theme';

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
  categoryFilter: string;
  onCategoryFilterChange: (value: string) => void;
  propertyOptions: PickerOption[];
  categoryOptions: PickerOption[];
}

export interface ExpenseFiltersSheetHostProps extends ExpenseFiltersStateProps {
  sheetVisible: boolean;
  onSheetVisibleChange: (visible: boolean) => void;
}

function countActiveFilters(
  statusFilter: StatusFilter,
  recurringFilter: RecurringFilter,
  typeFilter: TypeFilter,
  propertyFilter: string,
  categoryFilter: string,
): number {
  let count = 0;
  if (statusFilter !== 'all') count += 1;
  if (recurringFilter !== 'all') count += 1;
  if (typeFilter !== 'all') count += 1;
  if (propertyFilter !== 'all') count += 1;
  if (categoryFilter !== 'all') count += 1;
  return count;
}

export function countExpenseActiveFilters(
  statusFilter: StatusFilter,
  recurringFilter: RecurringFilter,
  typeFilter: TypeFilter,
  propertyFilter: string,
  categoryFilter: string,
): number {
  return countActiveFilters(
    statusFilter,
    recurringFilter,
    typeFilter,
    propertyFilter,
    categoryFilter,
  );
}

function useExpenseFilterChips({
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
  propertyOptions,
  categoryOptions,
}: ExpenseFiltersStateProps) {
  const { t } = useTranslation();

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

    if (propertyFilter !== 'all') {
      const label = propertyOptions.find((option) => option.value === propertyFilter)?.label;
      if (label) {
        chips.push({
          key: 'property',
          label,
          onClear: () => onPropertyFilterChange('all'),
        });
      }
    }

    if (categoryFilter !== 'all') {
      const label = categoryOptions.find((option) => option.value === categoryFilter)?.label;
      if (label) {
        chips.push({
          key: 'category',
          label,
          onClear: () => onCategoryFilterChange('all'),
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

    return chips;
  }, [
    categoryFilter,
    categoryOptions,
    onCategoryFilterChange,
    onPropertyFilterChange,
    onRecurringFilterChange,
    onStatusFilterChange,
    onTypeFilterChange,
    propertyFilter,
    propertyOptions,
    recurringFilter,
    statusFilter,
    t,
    typeFilter,
  ]);
}

/** Active filter chips shown above expense list content. */
export function ExpenseActiveFilterChips(props: ExpenseFiltersStateProps) {
  const chips = useExpenseFilterChips(props);
  if (chips.length === 0) return null;

  return (
    <View style={styles.container}>
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
  propertyOptions,
  categoryOptions,
}: ExpenseFiltersSheetHostProps) {
  const handleClearFilters = () => {
    onStatusFilterChange('all');
    onRecurringFilterChange('all');
    onTypeFilterChange('all');
    onPropertyFilterChange('all');
    onCategoryFilterChange('all');
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
      onClearFilters={handleClearFilters}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
});
