import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ReportFiltersSheet } from '@/components/reports/ReportFiltersSheet';
import type { PickerOption } from '@/components/ui/AppPicker';
import { FilterChipRow, type FilterChip } from '@/components/ui/FilterChipRow';
import { buildReportPeriod } from '@/hooks/useReports';
import type {
  ReportCategoryTypeFilter,
  ReportExpensePaymentStatus,
  ReportPeriod,
  ReportPeriodPreset,
} from '@/types/app.types';

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
  expensePaymentStatus: ReportExpensePaymentStatus;
  onExpensePaymentStatusChange: (value: ReportExpensePaymentStatus) => void;
  propertyOptions: PickerOption[];
  categoryOptions: PickerOption[];
}

export interface ReportFiltersSheetHostProps extends ReportFiltersStateProps {
  sheetVisible: boolean;
  onSheetVisibleChange: (visible: boolean) => void;
}

/**
 * Sheet/chip filters only — property is owned by the pill row, so it is not
 * counted here (avoids a duplicate “active” signal next to the pills).
 * `last_6_months` is the Analitika default and is not treated as an active filter.
 */
function countActiveFilters(
  period: ReportPeriod,
  categoryFilter: string,
  categoryTypeFilter: ReportCategoryTypeFilter,
): number {
  let count = 0;
  if (period.preset !== 'last_6_months') count += 1;
  if (categoryFilter !== 'all') count += 1;
  if (categoryTypeFilter !== 'all') count += 1;
  return count;
}

export function countReportActiveFilters(
  period: ReportPeriod,
  _propertyFilter: string,
  categoryFilter: string,
  categoryTypeFilter: ReportCategoryTypeFilter,
  _expensePaymentStatus: ReportExpensePaymentStatus = 'all',
): number {
  return countActiveFilters(period, categoryFilter, categoryTypeFilter);
}

function useReportFilterChips({
  period,
  onPeriodChange,
  categoryFilter,
  onCategoryFilterChange,
  categoryTypeFilter,
  onCategoryTypeFilterChange,
  categoryOptions,
}: ReportFiltersStateProps) {
  const { t } = useTranslation();

  return useMemo(() => {
    const chips: FilterChip[] = [];

    if (period.preset !== 'last_6_months') {
      chips.push({
        key: 'period',
        label: t(PERIOD_LABELS[period.preset]),
        onClear: () => onPeriodChange(buildReportPeriod('last_6_months')),
      });
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
        label: t('reports.typeRegularChip'),
        onClear: () => onCategoryTypeFilterChange('all'),
      });
    } else if (categoryTypeFilter === 'irregular') {
      chips.push({
        key: 'irregular',
        label: t('reports.typeIrregularChip'),
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
    period.preset,
    t,
  ]);
}

/** Active filter chips shown under property pills (Naslov `.fchip` row). */
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
  expensePaymentStatus,
  onExpensePaymentStatusChange,
  propertyOptions,
  categoryOptions,
}: ReportFiltersSheetHostProps) {
  const handleClearFilters = () => {
    onPeriodChange(buildReportPeriod('last_6_months'));
    onPropertyFilterChange('all');
    onCategoryFilterChange('all');
    onCategoryTypeFilterChange('all');
    onExpensePaymentStatusChange('all');
  };

  return (
    <ReportFiltersSheet
      visible={sheetVisible}
      onDismiss={() => onSheetVisibleChange(false)}
      period={period}
      onPeriodChange={onPeriodChange}
      propertyFilter={propertyFilter}
      categoryFilter={categoryFilter}
      onCategoryFilterChange={onCategoryFilterChange}
      categoryTypeFilter={categoryTypeFilter}
      onCategoryTypeFilterChange={onCategoryTypeFilterChange}
      categoryOptions={categoryOptions}
      onClearFilters={handleClearFilters}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
});
