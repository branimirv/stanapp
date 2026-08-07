import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  countReportActiveFilters,
  type ReportFiltersStateProps,
} from '@/components/reports/ReportFilters';
import type { PickerOption } from '@/components/ui/AppPicker';
import { useExpenseCategories } from '@/hooks/useExpenseCategories';
import { buildReportPeriod, useReports } from '@/hooks/useReports';
import { useProfile } from '@/hooks/useProfile';
import { useProperties } from '@/hooks/useProperties';
import { routes } from '@/lib/routes';
import { useTabBarStore } from '@/stores/tabBarStore';
import { useUiStore } from '@/stores/uiStore';
import type { Language, ReportCategoryTypeFilter, ReportPeriod } from '@/types/app.types';
import { getCategoryLabel } from '@/utils/expense';
import { exportReportAsPDF } from '@/utils/export';
import { formatReportPeriodEyebrow } from '@/utils/reportPeriodLabel';

/** Filters, report query, export, and actions for the Analitika tab. */
export function useReportsScreen() {
  const { t, i18n } = useTranslation();
  const showToast = useUiStore((state) => state.showToast);
  const setChromeHidden = useTabBarStore((s) => s.setChromeHidden);
  const { profile } = useProfile();
  const { properties } = useProperties();
  const { categories } = useExpenseCategories();

  const [period, setPeriod] = useState<ReportPeriod>(() =>
    buildReportPeriod('last_6_months'),
  );
  const [propertyFilter, setPropertyFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [categoryTypeFilter, setCategoryTypeFilter] =
    useState<ReportCategoryTypeFilter>('all');
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);

  const { report, isLoading, error, refetch } = useReports({
    period,
    propertyId: propertyFilter,
    categoryId: categoryFilter,
    categoryType: categoryTypeFilter,
  });
  const language = (profile?.language ?? i18n.language ?? 'hr') as Language;

  const propertyOptions: PickerOption[] = useMemo(
    () => [
      { label: t('reports.allProperties'), value: 'all' },
      ...properties.map((property) => ({ label: property.name, value: property.id })),
    ],
    [properties, t],
  );

  const categoryOptions: PickerOption[] = useMemo(
    () => [
      { label: t('reports.allCategories'), value: 'all' },
      ...categories.map((category) => ({
        label: getCategoryLabel(category, t),
        value: category.id,
      })),
    ],
    [categories, t],
  );

  const hasData = useMemo(() => {
    if (!report) return false;
    return report.totalIncome > 0 || report.totalExpenses > 0;
  }, [report]);

  const activeFilterCount = useMemo(
    () =>
      countReportActiveFilters(
        period,
        propertyFilter,
        categoryFilter,
        categoryTypeFilter,
      ),
    [categoryFilter, categoryTypeFilter, period, propertyFilter],
  );

  const downloadDisabled = !report || !hasData || exporting;
  const showPerProperty = propertyFilter === 'all';
  const periodEyebrow = formatReportPeriodEyebrow(period, language, t);

  const filterStateProps: ReportFiltersStateProps = {
    period,
    onPeriodChange: setPeriod,
    propertyFilter,
    onPropertyFilterChange: setPropertyFilter,
    categoryFilter,
    onCategoryFilterChange: setCategoryFilter,
    categoryTypeFilter,
    onCategoryTypeFilterChange: setCategoryTypeFilter,
    propertyOptions,
    categoryOptions,
  };

  const handleFiltersVisibleChange = useCallback(
    (open: boolean) => {
      setFiltersVisible(open);
      setChromeHidden(open);
    },
    [setChromeHidden],
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const handleExport = useCallback(async () => {
    if (!report || !hasData || exporting) return;

    setExporting(true);
    try {
      await exportReportAsPDF(report, t, language);
      showToast({ message: t('reports.exportSuccess'), type: 'success' });
    } catch (err) {
      showToast({
        message: err instanceof Error ? err.message : t('reports.exportFailed'),
        type: 'error',
      });
    } finally {
      setExporting(false);
    }
  }, [exporting, hasData, language, report, showToast, t]);

  const handlePropertyPill = useCallback((value: string) => {
    setPropertyFilter(value);
  }, []);

  const handleAddExpense = useCallback(() => {
    if (propertyFilter !== 'all') {
      router.push({ pathname: routes.expense.new, params: { propertyId: propertyFilter } });
      return;
    }
    router.push(routes.expense.new);
  }, [propertyFilter]);

  const handleFilterPress = useCallback(() => {
    handleFiltersVisibleChange(true);
  }, [handleFiltersVisibleChange]);

  return {
    t,
    language,
    properties,
    report,
    isLoading,
    error,
    refetch,
    hasData,
    showPerProperty,
    periodEyebrow,
    propertyFilter,
    filterStateProps,
    activeFilterCount,
    downloadDisabled,
    filtersVisible,
    handleFiltersVisibleChange,
    refreshing,
    onRefresh,
    handleExport,
    handleFilterPress,
    handlePropertyPill,
    handleAddExpense,
  };
}
