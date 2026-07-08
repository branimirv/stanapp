import { SlidersHorizontal } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { ReportFiltersSheet } from '@/components/reports/ReportFiltersSheet';
import type { PickerOption } from '@/components/ui/AppPicker';
import { FilterChipRow, type FilterChip } from '@/components/ui/FilterChipRow';
import { Colors, Spacing, Typography } from '@/constants/theme';
import type { ReportCategoryTypeFilter } from '@/types/app.types';

export interface ReportFiltersProps {
  propertyFilter: string;
  onPropertyFilterChange: (value: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (value: string) => void;
  categoryTypeFilter: ReportCategoryTypeFilter;
  onCategoryTypeFilterChange: (value: ReportCategoryTypeFilter) => void;
  propertyOptions: PickerOption[];
  categoryOptions: PickerOption[];
}

function countActiveFilters(
  propertyFilter: string,
  categoryFilter: string,
  categoryTypeFilter: ReportCategoryTypeFilter,
): number {
  let count = 0;
  if (propertyFilter !== 'all') count += 1;
  if (categoryFilter !== 'all') count += 1;
  if (categoryTypeFilter !== 'all') count += 1;
  return count;
}

export function ReportFilters({
  propertyFilter,
  onPropertyFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  categoryTypeFilter,
  onCategoryTypeFilterChange,
  propertyOptions,
  categoryOptions,
}: ReportFiltersProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const [sheetVisible, setSheetVisible] = useState(false);

  const activeFilterCount = useMemo(
    () => countActiveFilters(propertyFilter, categoryFilter, categoryTypeFilter),
    [categoryFilter, categoryTypeFilter, propertyFilter],
  );

  const handleClearFilters = () => {
    onPropertyFilterChange('all');
    onCategoryFilterChange('all');
    onCategoryTypeFilterChange('all');
  };

  const activeFilterChips = useMemo(() => {
    const chips: FilterChip[] = [];

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

    if (categoryTypeFilter === 'regular') {
      chips.push({
        key: 'regular',
        label: t('reports.typeRegular'),
        onClear: () => onCategoryTypeFilterChange('all'),
      });
    } else if (categoryTypeFilter === 'irregular') {
      chips.push({
        key: 'irregular',
        label: t('reports.typeIrregular'),
        onClear: () => onCategoryTypeFilterChange('all'),
      });
    }

    return chips;
  }, [
    categoryFilter,
    categoryOptions,
    categoryTypeFilter,
    onCategoryFilterChange,
    onCategoryTypeFilterChange,
    onPropertyFilterChange,
    propertyFilter,
    propertyOptions,
    t,
  ]);

  const filtersAccessibilityLabel =
    activeFilterCount > 0
      ? t('reports.filtersWithCount', { count: activeFilterCount })
      : t('reports.filters');

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => setSheetVisible(true)}
        style={({ pressed }) => [
          styles.filtersTrigger,
          {
            borderColor: theme.colors.outline,
            backgroundColor: theme.dark ? Colors.surfaceDark : Colors.surface,
            opacity: pressed ? 0.7 : 1,
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel={filtersAccessibilityLabel}
      >
        <SlidersHorizontal size={16} color={theme.colors.primary} strokeWidth={2.5} />
        <Text style={[styles.filtersLabel, { color: theme.colors.primary }]}>
          {t('reports.filters')}
        </Text>
        {activeFilterCount > 0 ? (
          <View style={[styles.badge, { backgroundColor: theme.colors.primary }]}>
            <Text style={[styles.badgeText, { color: theme.colors.onPrimary }]}>
              {activeFilterCount}
            </Text>
          </View>
        ) : null}
      </Pressable>

      <FilterChipRow chips={activeFilterChips} />

      <ReportFiltersSheet
        visible={sheetVisible}
        onDismiss={() => setSheetVisible(false)}
        propertyFilter={propertyFilter}
        onPropertyFilterChange={onPropertyFilterChange}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={onCategoryFilterChange}
        categoryTypeFilter={categoryTypeFilter}
        onCategoryTypeFilterChange={onCategoryTypeFilterChange}
        propertyOptions={propertyOptions}
        categoryOptions={categoryOptions}
        onClearFilters={handleClearFilters}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  filtersTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
  },
  filtersLabel: {
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
