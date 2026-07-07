import { SlidersHorizontal, X } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import {
  ExpenseMoreFiltersSheet,
  type RecurringFilter,
  type TypeFilter,
} from '@/components/expense/ExpenseMoreFiltersSheet';
import type { PickerOption } from '@/components/ui/AppPicker';
import { AppSegmentedControl } from '@/components/ui/AppSegmentedControl';
import { Colors, Spacing, Typography } from '@/constants/theme';
import type { ExpenseStatusFilter } from '@/types/app.types';

export type StatusFilter = 'all' | ExpenseStatusFilter;

export interface ExpenseFiltersProps {
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
  onInteraction?: () => void;
}

interface ActiveFilterChip {
  key: string;
  label: string;
  onClear: () => void;
}

function countSecondaryFilters(
  recurringFilter: RecurringFilter,
  typeFilter: TypeFilter,
  propertyFilter: string,
  categoryFilter: string,
): number {
  let count = 0;
  if (recurringFilter !== 'all') count += 1;
  if (typeFilter !== 'all') count += 1;
  if (propertyFilter !== 'all') count += 1;
  if (categoryFilter !== 'all') count += 1;
  return count;
}

function ActiveFilterChipRow({ chips }: { chips: ActiveFilterChip[] }) {
  const theme = useTheme();
  const { t } = useTranslation();

  if (chips.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.chipRow}
      keyboardShouldPersistTaps="handled"
    >
      {chips.map((chip) => (
        <View
          key={chip.key}
          style={[
            styles.chip,
            {
              backgroundColor: theme.dark ? Colors.surfaceVariantDark : Colors.primaryLight,
              borderColor: theme.colors.primary,
            },
          ]}
        >
          <Text
            style={[styles.chipLabel, { color: theme.colors.primary }]}
            numberOfLines={1}
          >
            {chip.label}
          </Text>
          <Pressable
            onPress={chip.onClear}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={t('expenses.removeFilter', { filter: chip.label })}
          >
            <X size={14} color={theme.colors.primary} strokeWidth={2.5} />
          </Pressable>
        </View>
      ))}
    </ScrollView>
  );
}

export function ExpenseFilters({
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
  onInteraction,
}: ExpenseFiltersProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const [sheetVisible, setSheetVisible] = useState(false);

  const secondaryFilterCount = useMemo(
    () =>
      countSecondaryFilters(recurringFilter, typeFilter, propertyFilter, categoryFilter),
    [categoryFilter, propertyFilter, recurringFilter, typeFilter],
  );

  const handleClearSecondaryFilters = () => {
    onRecurringFilterChange('all');
    onTypeFilterChange('all');
    onPropertyFilterChange('all');
    onCategoryFilterChange('all');
  };

  const activeFilterChips = useMemo(() => {
    const chips: ActiveFilterChip[] = [];

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
    onTypeFilterChange,
    propertyFilter,
    propertyOptions,
    recurringFilter,
    t,
    typeFilter,
  ]);

  const moreFiltersAccessibilityLabel =
    secondaryFilterCount > 0
      ? t('expenses.moreFiltersWithCount', { count: secondaryFilterCount })
      : t('expenses.moreFilters');

  return (
    <View style={styles.container}>
      <AppSegmentedControl
        segments={[
          { label: t('expenses.filterAll'), value: 'all' },
          { label: t('expenses.filterUnpaid'), value: 'unpaid' },
          { label: t('expenses.filterPaid'), value: 'paid' },
          { label: t('expenses.overdue'), value: 'overdue' },
        ]}
        value={statusFilter}
        onValueChange={(value) => {
          onInteraction?.();
          onStatusFilterChange(value as StatusFilter);
        }}
      />

      <ActiveFilterChipRow chips={activeFilterChips} />

      <Pressable
        onPress={() => {
          onInteraction?.();
          setSheetVisible(true);
        }}
        style={({ pressed }) => [
          styles.moreFiltersTrigger,
          { opacity: pressed ? 0.7 : 1 },
        ]}
        accessibilityRole="button"
        accessibilityLabel={moreFiltersAccessibilityLabel}
      >
        <SlidersHorizontal size={16} color={theme.colors.primary} strokeWidth={2.5} />
        <Text style={[styles.moreFiltersLabel, { color: theme.colors.primary }]}>
          {t('expenses.moreFilters')}
        </Text>
        {secondaryFilterCount > 0 ? (
          <View style={[styles.badge, { backgroundColor: theme.colors.primary }]}>
            <Text style={[styles.badgeText, { color: theme.colors.onPrimary }]}>
              {secondaryFilterCount}
            </Text>
          </View>
        ) : null}
      </Pressable>

      <ExpenseMoreFiltersSheet
        visible={sheetVisible}
        onDismiss={() => setSheetVisible(false)}
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
        onClearFilters={handleClearSecondaryFilters}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
    padding: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
    paddingLeft: Spacing.sm,
    paddingRight: Spacing.xs,
    borderRadius: 16,
    borderWidth: 1,
    maxWidth: 200,
  },
  chipLabel: {
    ...Typography.labelMedium,
    flexShrink: 1,
  },
  moreFiltersTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
    alignSelf: 'flex-start',
  },
  moreFiltersLabel: {
    ...Typography.labelLarge,
    fontWeight: '600',
  },
  badge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    ...Typography.labelSmall,
    fontWeight: '700',
    fontSize: 11,
  },
});
