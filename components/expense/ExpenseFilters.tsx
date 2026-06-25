import { SlidersHorizontal } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import {
  ExpenseMoreFiltersSheet,
  type RecurringFilter,
  type TypeFilter,
} from '@/components/expense/ExpenseMoreFiltersSheet';
import { AppInlineFilter } from '@/components/ui/AppInlineFilter';
import type { PickerOption } from '@/components/ui/AppPicker';
import { AppSegmentedControl } from '@/components/ui/AppSegmentedControl';
import { Spacing, Typography } from '@/constants/theme';
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

      <View style={styles.filterRow}>
        <AppInlineFilter
          options={propertyOptions}
          value={propertyFilter}
          onValueChange={onPropertyFilterChange}
          title={t('expenses.filterByProperty')}
          prefixLabel={t('expenses.property')}
          showChevron
          style={styles.inlineFilter}
          onOpen={onInteraction}
        />
        <AppInlineFilter
          options={categoryOptions}
          value={categoryFilter}
          onValueChange={onCategoryFilterChange}
          title={t('expenses.filterByCategory')}
          prefixLabel={t('expenses.category')}
          showChevron
          style={styles.inlineFilter}
          onOpen={onInteraction}
        />
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
          accessibilityLabel={t('expenses.moreFilters')}
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
      </View>

      <ExpenseMoreFiltersSheet
        visible={sheetVisible}
        onDismiss={() => setSheetVisible(false)}
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
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: Spacing.sm,
    minHeight: 40,
    paddingVertical: Spacing.xs,
  },
  inlineFilter: {
    flexShrink: 0,
  },
  moreFiltersTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
    marginLeft: 'auto',
    flexShrink: 0,
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
