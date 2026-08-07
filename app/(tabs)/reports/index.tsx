import { parseISO } from 'date-fns';
import { router } from 'expo-router';
import { BarChart3, Plus } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import { ExpenseBreakdown } from '@/components/reports/ExpenseBreakdown';
import { NetCashFlowChart } from '@/components/reports/NetCashFlowChart';
import { PropertyNetList } from '@/components/reports/PropertyNetList';
import {
  countReportActiveFilters,
  ReportActiveFilterChips,
  ReportFiltersSheetHost,
  type ReportFiltersStateProps,
} from '@/components/reports/ReportFilters';
import { ReportScreenActions } from '@/components/reports/ReportScreenActions';
import { APP_BOTTOM_SHEET_CLOSE_MS } from '@/components/ui/AppBottomSheet';
import type { PickerOption } from '@/components/ui/AppPicker';
import { BlurOverlay } from '@/components/ui/BlurOverlay';
import { DisplayAmount } from '@/components/ui/DisplayAmount';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { FLOATING_ACTIONS_ROW_HEIGHT } from '@/components/ui/FloatingScreenActions';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { Spacing } from '@/constants/theme';
import { useExpenseCategories } from '@/hooks/useExpenseCategories';
import { buildReportPeriod, useReports } from '@/hooks/useReports';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useProfile } from '@/hooks/useProfile';
import { useProperties } from '@/hooks/useProperties';
import { displayFontFamily } from '@/lib/fonts';
import { routes } from '@/lib/routes';
import { cn } from '@/lib/utils';
import { useTabBarStore } from '@/stores/tabBarStore';
import { useUiStore } from '@/stores/uiStore';
import { getCategoryLabel } from '@/utils/expense';
import { exportReportAsPDF } from '@/utils/export';
import { formatMonthName, formatPeriod } from '@/utils/formatters';
import type {
  Language,
  ReportCategoryTypeFilter,
  ReportPeriod,
} from '@/types/app.types';

function capitalizeLabel(label: string, language: Language): string {
  return label.replace(/^./, (ch) =>
    ch.toLocaleUpperCase(language === 'en' ? 'en' : 'hr'),
  );
}

function formatReportPeriodEyebrow(
  period: ReportPeriod,
  language: Language,
  t: (key: string) => string,
): string {
  if (period.preset === 'all_time') return t('reports.periodAllTime');

  const start = parseISO(period.startDate);
  const end = parseISO(period.endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return t('reports.periodCustom');
  }

  const startMonth = start.getMonth() + 1;
  const startYear = start.getFullYear();
  const endMonth = end.getMonth() + 1;
  const endYear = end.getFullYear();

  if (startYear === endYear && startMonth === endMonth) {
    return capitalizeLabel(formatPeriod(endMonth, endYear, language), language);
  }

  if (startYear === endYear) {
    return `${capitalizeLabel(formatMonthName(startMonth, startYear, language), language)} – ${formatPeriod(endMonth, endYear, language)}`;
  }

  return `${capitalizeLabel(formatPeriod(startMonth, startYear, language), language)} – ${formatPeriod(endMonth, endYear, language)}`;
}

export default function ReportsScreen() {
  const { t, i18n } = useTranslation();
  const { theme } = useAppTheme();
  const { colors, elevation } = theme;
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

  if (isLoading && !report) {
    return (
      <View className="flex-1 bg-transparent">
        <SkeletonLoader count={5} height={120} className="p-4" />
      </View>
    );
  }

  if (error && !report) {
    return (
      <View className="flex-1 bg-transparent">
        <ErrorState message={error} onRetry={refetch} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-transparent" collapsable={false}>
      <ScrollView
        className="flex-1"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={[
          {
            flexGrow: 1,
            paddingTop: 0,
            paddingHorizontal: theme.spacing.gutter,
            paddingBottom: Spacing.scrollBottom,
          },
          (!report || !hasData) ? { flexGrow: 0 } : null,
        ]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ height: FLOATING_ACTIONS_ROW_HEIGHT }} />

        <View className="mb-4">
          <Text className="text-muted mb-2.5 text-[11px] leading-3.5 font-semibold tracking-[1.54px] uppercase">
            {periodEyebrow}
          </Text>
          <Text
            className="text-fg text-[34px] tracking-[-0.85px]"
            style={{
              fontFamily: displayFontFamily(theme.name),
              lineHeight: 34,
            }}
          >
            {t('reports.title')}
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-3.5 grow-0"
          style={{ marginHorizontal: -17 }}
          contentContainerClassName="flex-row gap-2 pb-px"
          contentContainerStyle={{ paddingHorizontal: theme.spacing.gutter }}
        >
          <Pressable
            onPress={() => handlePropertyPill('all')}
            className={cn(
              'h-8.5 items-center justify-center rounded-full px-3.5',
              propertyFilter === 'all' ? 'bg-primary-tint' : 'bg-surface-2',
            )}
            accessibilityRole="button"
            accessibilityState={{ selected: propertyFilter === 'all' }}
          >
            <Text
              className={cn(
                'text-[13px] font-semibold',
                propertyFilter === 'all' ? 'text-primary' : 'text-muted',
              )}
            >
              {t('reports.allProperties')}
            </Text>
          </Pressable>
          {properties.map((property) => {
            const on = propertyFilter === property.id;
            return (
              <Pressable
                key={property.id}
                onPress={() => handlePropertyPill(property.id)}
                className={cn(
                  'h-8.5 items-center justify-center rounded-full px-3.5',
                  on ? 'bg-primary-tint' : 'bg-surface-2',
                )}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
              >
                <Text
                  className={cn('text-[13px] font-semibold', on ? 'text-primary' : 'text-muted')}
                  numberOfLines={1}
                >
                  {property.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <ReportActiveFilterChips {...filterStateProps} />

        {!report || !hasData ? (
          <EmptyState
            icon={BarChart3}
            title={t('empty.noReports')}
            subtitle={t('empty.noReportsHint')}
            ctaLabel={t('expenses.addNew')}
            ctaIcon={Plus}
            onCtaPress={handleAddExpense}
            className="mt-1"
          />
        ) : (
          <>
            {report.hasMixedCurrencies ? (
              <View
                className="border-bd bg-surface-2 mb-3 rounded-md border p-3.5"
                style={{ borderWidth: StyleSheet.hairlineWidth }}
              >
                <Text className="text-muted text-[13px]">
                  {t('reports.mixedCurrencyWarning')}
                </Text>
              </View>
            ) : null}

            <NetCashFlowChart
              data={report.monthlyIncomeExpense}
              netTotal={report.netIncome}
              currency={report.currency}
              language={language}
              comparison={report.comparison}
            />

            <View
              className="border-card-bd bg-surface mb-5 flex-row overflow-hidden rounded-xl border"
              style={[{ borderWidth: StyleSheet.hairlineWidth }, elevation.card]}
            >
              {(
                [
                  {
                    label: t('reports.incomeBay'),
                    amount: report.totalIncome,
                    color: colors.fg,
                  },
                  {
                    label: t('reports.expenseBay'),
                    amount: report.totalExpenses,
                    color: colors.fg,
                  },
                  {
                    label: t('reports.netBay'),
                    amount: report.netIncome,
                    color: colors.primary,
                  },
                ] as const
              ).map((bay, index) => (
                <View key={bay.label} className="flex-1 flex-row">
                  {index > 0 ? (
                    <View className="bg-bd" style={{ width: StyleSheet.hairlineWidth }} />
                  ) : null}
                  <View className="flex-1 px-3 py-4">
                    <Text className="text-muted mb-2.25 text-[10px] font-semibold tracking-[0.8px] uppercase">
                      {bay.label}
                    </Text>
                    <DisplayAmount
                      amount={bay.amount}
                      currency={report.currency === 'EUR' ? '€' : report.currency}
                      language={language}
                      size={19}
                      lineHeight={19}
                      letterSpacing={-0.38}
                      color={bay.color}
                    />
                  </View>
                </View>
              ))}
            </View>

            {showPerProperty ? (
              <PropertyNetList
                summaries={report.propertySummaries}
                language={language}
              />
            ) : null}

            <ExpenseBreakdown
              data={report.categoryBreakdown}
              currency={report.currency}
              language={language}
              style={{ marginTop: 22, marginBottom: 8 }}
            />
          </>
        )}
      </ScrollView>

      <ReportScreenActions
        activeFilterCount={activeFilterCount}
        onFilterPress={() => handleFiltersVisibleChange(true)}
        onDownloadPress={handleExport}
        downloadDisabled={downloadDisabled}
      />

      <BlurOverlay
        visible={filtersVisible}
        intensity="strong"
        tint="dark"
        duration={APP_BOTTOM_SHEET_CLOSE_MS}
        zIndex={5}
      />
      <ReportFiltersSheetHost
        sheetVisible={filtersVisible}
        onSheetVisibleChange={handleFiltersVisibleChange}
        {...filterStateProps}
      />
    </View>
  );
}

