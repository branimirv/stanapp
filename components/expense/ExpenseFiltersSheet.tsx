import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
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
import type { PickerOption } from '@/components/ui/AppPicker';
import { useExpenseCategories } from '@/hooks/useExpenseCategories';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Fonts } from '@/lib/fonts';
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

interface FilterChipOption<T extends string> {
  label: string;
  value: T;
}

function FilterChipRow<T extends string>({
  options,
  value,
  onChange,
  style,
}: {
  options: FilterChipOption<T>[];
  value: T;
  onChange: (value: T) => void;
  style?: StyleProp<ViewStyle>;
}) {
  const { theme } = useAppTheme();
  const { colors } = theme;

  return (
    <View style={[styles.chipRow, style]}>
      {options.map((option) => {
        const on = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[
              styles.chip,
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
                fontSize: 12.5,
                letterSpacing: -0.12,
                color: on ? colors.primary : colors.muted,
              }}
              numberOfLines={1}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function FilterGroup({
  label,
  children,
  style,
}: {
  label: string;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const { theme } = useAppTheme();
  const { colors } = theme;

  return (
    <View style={[styles.group, style]}>
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
        {label}
      </Text>
      {children}
    </View>
  );
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

  const statusOptions: FilterChipOption<StatusFilter>[] = [
    { label: t('expenses.filterAll'), value: 'all' },
    { label: t('expenses.filterUnpaid'), value: 'unpaid' },
    { label: t('expenses.filterPaid'), value: 'paid' },
    { label: t('expenses.overdue'), value: 'overdue' },
  ];

  const recurringOptions: FilterChipOption<RecurringFilter>[] = [
    { label: t('common.all'), value: 'all' },
    { label: t('expenses.filterRecurring'), value: 'recurring' },
    { label: t('expenses.filterOneTime'), value: 'one_time' },
  ];

  const typeOptions: FilterChipOption<TypeFilter>[] = [
    { label: t('common.all'), value: 'all' },
    { label: t('expenses.filterRegular'), value: 'regular' },
    { label: t('expenses.filterIrregular'), value: 'irregular' },
  ];

  const periodOptions: FilterChipOption<ExpensePeriodPreset>[] = [
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

  return (
    <AppBottomSheet
      visible={visible}
      onDismiss={onDismiss}
      title={t('expenses.filters')}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        <FilterGroup label={t('common.status')}>
          <FilterChipRow
            options={statusOptions}
            value={statusFilter}
            onChange={onStatusFilterChange}
          />
        </FilterGroup>

        <FilterGroup label={t('expenses.category')}>
          <View style={styles.categoryGrid}>
            <Pressable
              onPress={() => onCategoryFilterChange([])}
              style={[
                styles.categoryChip,
                {
                  borderColor: allCategoriesSelected ? colors.primary : 'transparent',
                  backgroundColor: allCategoriesSelected
                    ? colors.primaryTint
                    : colors.surface2,
                },
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected: allCategoriesSelected }}
              accessibilityLabel={t('common.all')}
            >
              <Text
                style={{
                  fontFamily: Fonts.sans.semibold,
                  fontSize: 12,
                  color: allCategoriesSelected ? colors.primary : colors.muted,
                  paddingHorizontal: 4,
                  paddingVertical: 2,
                }}
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
                  style={[
                    styles.categoryChip,
                    {
                      borderColor: selected ? colors.primary : 'transparent',
                      backgroundColor: selected
                        ? colors.primaryTint
                        : `${category.color}22`,
                    },
                  ]}
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
          <FilterChipRow
            options={recurringOptions}
            value={recurringFilter}
            onChange={onRecurringFilterChange}
          />
        </FilterGroup>

        <FilterGroup label={t('expenses.expenseType')}>
          <FilterChipRow
            options={typeOptions}
            value={typeFilter}
            onChange={onTypeFilterChange}
          />
        </FilterGroup>

        <FilterGroup label={t('expenses.period')} style={styles.groupLast}>
          <FilterChipRow
            options={periodOptions}
            value={period.preset}
            onChange={handlePeriodChange}
          />
          {period.preset === 'custom' ? (
            <View style={styles.customRange}>
              <AppDatePicker
                label={t('common.from')}
                value={parseDateValue(customStart)}
                onChange={handleCustomStartChange}
                maximumDate={parseDateValue(customEnd) ?? undefined}
                style={styles.dateField}
              />
              <AppDatePicker
                label={t('common.to')}
                value={parseDateValue(customEnd)}
                onChange={handleCustomEndChange}
                minimumDate={parseDateValue(customStart) ?? undefined}
                style={styles.dateField}
              />
            </View>
          ) : null}
        </FilterGroup>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          onPress={handleClear}
          accessibilityRole="button"
          accessibilityLabel={t('common.clearFilters')}
          style={[styles.footerBtn, styles.clearBtn, { backgroundColor: colors.surface2 }]}
        >
          <Text
            style={{
              fontFamily: Fonts.sans.semibold,
              fontSize: 14,
              letterSpacing: -0.14,
              color: colors.fg,
            }}
            numberOfLines={1}
          >
            {t('common.clearFilters')}
          </Text>
        </Pressable>

        <Pressable
          onPress={onDismiss}
          accessibilityRole="button"
          accessibilityLabel={
            activeCount > 0
              ? `${t('common.done')} ${activeCount}`
              : t('common.done')
          }
          style={[styles.footerBtn, styles.doneBtn, { backgroundColor: colors.primary }]}
        >
          <Text
            style={{
              fontFamily: Fonts.sans.semibold,
              fontSize: 14,
              letterSpacing: -0.14,
              color: colors.onPrimary,
            }}
          >
            {t('common.done')}
          </Text>
          {activeCount > 0 ? (
            <View style={[styles.fcount, { backgroundColor: 'rgba(0,0,0,0.18)' }]}>
              <Text
                style={{
                  fontFamily: Fonts.sans.bold,
                  fontSize: 10,
                  color: colors.onPrimary,
                }}
              >
                {activeCount}
              </Text>
            </View>
          ) : null}
        </Pressable>
      </View>
    </AppBottomSheet>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 0,
    maxHeight: 420,
  },
  scrollContent: {
    paddingBottom: 8,
  },
  group: {
    marginBottom: 18,
  },
  groupLast: {
    marginBottom: 24,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    height: 34,
    paddingHorizontal: 14,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customRange: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  dateField: {
    flex: 1,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    borderRadius: 999,
    borderWidth: 1.5,
    flexShrink: 0,
  },
  footer: {
    flexDirection: 'row',
    gap: 9,
  },
  footerBtn: {
    height: 44,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 16,
  },
  clearBtn: {
    flex: 1,
  },
  doneBtn: {
    flex: 2,
  },
  fcount: {
    minWidth: 16,
    height: 16,
    paddingHorizontal: 4,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
