import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ReportFiltersSheet } from '@/components/reports/ReportFiltersSheet';
import type { PickerOption } from '@/components/ui/AppPicker';
import { FilterChipRow, type FilterChip } from '@/components/ui/FilterChipRow';
import { buildReportPeriod } from '@/hooks/useReports';
import { Spacing } from '@/constants/theme';
import type { ReportCategoryTypeFilter, ReportPeriod, ReportPeriodPreset } from '@/types/app.types';

const PERIOD_LABELS: Record<ReportPeriodPreset, string> = {
  all_time: 'reports.periodAllTime',
  current_month: 'reports.periodThisMonth',
  last_3_months: 'reports.period3M',
  last_6_months: 'reports.period6M',
  last_12_months: 'reports.period12M',
  custom: 'reports.periodCustom',
};

export interface ReportFiltersStateProps {
  period: ReportPeriod;
  onPeriodChange: (period: ReportPeriod) => void;
  propertyFilter: string;
  onPropertyFilterChange: (value: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (value: string) => void;
  categoryTypeFilter: ReportCategoryTypeFilter;
  onCategoryTypeFilterChange: (value: ReportCategoryTypeFilter) => void;
  propertyOptions: PickerOption[];
  categoryOptions: PickerOption[];
}

export interface ReportFiltersSheetHostProps extends ReportFiltersStateProps {
  sheetVisible: boolean;
  onSheetVisibleChange: (visible: boolean) => void;
}

function countActiveFilters(
  period: ReportPeriod,
  propertyFilter: string,
  categoryFilter: string,
  categoryTypeFilter: ReportCategoryTypeFilter,
): number {
  let count = 0;
  if (period.preset !== 'all_time') count += 1;
  if (propertyFilter !== 'all') count += 1;
  if (categoryFilter !== 'all') count += 1;
  if (categoryTypeFilter !== 'all') count += 1;
  return count;
}

export function countReportActiveFilters(
  period: ReportPeriod,
  propertyFilter: string,
  categoryFilter: string,
  categoryTypeFilter: ReportCategoryTypeFilter,
): number {
  return countActiveFilters(period, propertyFilter, categoryFilter, categoryTypeFilter);
}

function useReportFilterChips({
  period,
  onPeriodChange,
  propertyFilter,
  onPropertyFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  categoryTypeFilter,
  onCategoryTypeFilterChange,
  propertyOptions,
  categoryOptions,
}: ReportFiltersStateProps) {
  const { t } = useTranslation();

  return useMemo(() => {
    const chips: FilterChip[] = [];

    if (period.preset !== 'all_time') {
      chips.push({
        key: 'period',
        label: t(PERIOD_LABELS[period.preset]),
        onClear: () => onPeriodChange(buildReportPeriod('all_time')),
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
    onPeriodChange,
    onPropertyFilterChange,
    period.preset,
    propertyFilter,
    propertyOptions,
    t,
  ]);
}

/** Active filter chips shown above report content. */
export function ReportActiveFilterChips(props: ReportFiltersStateProps) {
  const chips = useReportFilterChips(props);
  if (chips.length === 0) return null;

  return (
    <View style={styles.container}>
      <FilterChipRow chips={chips} />
    </View>
  );
}

/** Filter sheet host kept outside scroll/list trees. */
export function ReportFiltersSheetHost({
  sheetVisible,
  onSheetVisibleChange,
  period,
  onPeriodChange,
  propertyFilter,
  onPropertyFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  categoryTypeFilter,
  onCategoryTypeFilterChange,
  propertyOptions,
  categoryOptions,
}: ReportFiltersSheetHostProps) {
  const handleClearFilters = () => {
    onPeriodChange(buildReportPeriod('all_time'));
    onPropertyFilterChange('all');
    onCategoryFilterChange('all');
    onCategoryTypeFilterChange('all');
  };

  return (
    <ReportFiltersSheet
      visible={sheetVisible}
      onDismiss={() => onSheetVisibleChange(false)}
      period={period}
      onPeriodChange={onPeriodChange}
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
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
});
