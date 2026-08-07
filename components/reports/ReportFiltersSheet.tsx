import { useMemo } from 'react';
import { ScrollView, Text } from 'react-native';
import { useTranslation } from 'react-i18next';

import { PeriodFilter } from '@/components/reports/PeriodFilter';
import { AppBottomSheet } from '@/components/ui/AppBottomSheet';
import { AppFilterSheetFooter } from '@/components/ui/AppFilterSheetFooter';
import { AppPicker, type PickerOption } from '@/components/ui/AppPicker';
import { FilterGroup } from '@/components/ui/FilterGroup';
import {
  FilterOptionChipRow,
  type FilterOptionChip,
} from '@/components/ui/FilterOptionChipRow';
import { useEarliestReportActivity } from '@/hooks/useEarliestReportActivity';
import type { ReportCategoryTypeFilter, ReportPeriod } from '@/types/app.types';

export interface ReportFiltersSheetProps {
  visible: boolean;
  onDismiss: () => void;
  period: ReportPeriod;
  onPeriodChange: (period: ReportPeriod) => void;
  /** Used to re-seed custom period Od when property pills change. */
  propertyFilter: string;
  categoryFilter: string;
  onCategoryFilterChange: (value: string) => void;
  categoryTypeFilter: ReportCategoryTypeFilter;
  onCategoryTypeFilterChange: (value: ReportCategoryTypeFilter) => void;
  categoryOptions: PickerOption[];
  onClearFilters: () => void;
}

/** Naslov report filters — BlurOverlay must be a sibling on the host screen. */
export function ReportFiltersSheet({
  visible,
  onDismiss,
  period,
  onPeriodChange,
  propertyFilter,
  categoryFilter,
  onCategoryFilterChange,
  categoryTypeFilter,
  onCategoryTypeFilterChange,
  categoryOptions,
  onClearFilters,
}: ReportFiltersSheetProps) {
  const { t } = useTranslation();
  const { earliestActivityDate } = useEarliestReportActivity(propertyFilter);

  const activeCount = useMemo(() => {
    let count = 0;
    if (period.preset !== 'last_6_months') count += 1;
    if (categoryFilter !== 'all') count += 1;
    if (categoryTypeFilter !== 'all') count += 1;
    return count;
  }, [categoryFilter, categoryTypeFilter, period.preset]);

  const typeOptions: FilterOptionChip<ReportCategoryTypeFilter>[] = [
    { label: t('reports.typeAll'), value: 'all' },
    { label: t('reports.typeRegular'), value: 'regular' },
    { label: t('reports.typeIrregular'), value: 'irregular' },
  ];

  const handleClear = () => {
    onClearFilters();
    onDismiss();
  };

  const doneLabel =
    activeCount > 0 ? `${t('common.done')} ${activeCount}` : t('common.done');

  return (
    <AppBottomSheet visible={visible} onDismiss={onDismiss} title={t('reports.filters')}>
      <ScrollView
        className="max-h-105 grow-0"
        contentContainerClassName="pb-1"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        <FilterGroup label={t('reports.periodFilter')}>
          <PeriodFilter
            value={period}
            onChange={onPeriodChange}
            propertyFilter={propertyFilter}
            earliestActivityDate={earliestActivityDate}
          />
        </FilterGroup>

        <FilterGroup label={t('reports.filterCategory')}>
          <AppPicker
            options={categoryOptions}
            value={categoryFilter}
            onValueChange={onCategoryFilterChange}
            placeholder={t('reports.allCategories')}
          />
        </FilterGroup>

        <FilterGroup label={t('reports.filterType')} className="mb-2.5">
          <FilterOptionChipRow
            options={typeOptions}
            value={categoryTypeFilter}
            onChange={onCategoryTypeFilterChange}
          />
        </FilterGroup>

        <Text className="text-muted mb-5.5 text-[11.5px] leading-4.5">
          {t('reports.expenseFilterHint')}
        </Text>
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
