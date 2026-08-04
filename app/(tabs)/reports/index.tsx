import { BarChart3 } from 'lucide-react-native';
import { useCallback, useMemo, useState, type ReactNode } from 'react';
import {
  FlatList,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { ExpenseBreakdown } from '@/components/reports/ExpenseBreakdown';
import { IncomeExpenseTrendChart } from '@/components/reports/IncomeExpenseTrendChart';
import { NetCashFlowChart } from '@/components/reports/NetCashFlowChart';
import {
  countReportActiveFilters,
  ReportActiveFilterChips,
  ReportFiltersSheetHost,
  type ReportFiltersStateProps,
} from '@/components/reports/ReportFilters';
import { ReportScreenActions } from '@/components/reports/ReportScreenActions';
import { AppCard } from '@/components/ui/AppCard';
import type { PickerOption } from '@/components/ui/AppPicker';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import {
  FLOATING_ACTIONS_ROW_HEIGHT,
  useFloatingActionsInset,
} from '@/components/ui/FloatingScreenActions';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { Text } from '@/components/ui/text';
import { listPerformanceProps } from '@/constants/list';
import { Colors, Spacing } from '@/constants/theme';
import { useExpenseCategories } from '@/hooks/useExpenseCategories';
import { buildReportPeriod, useReports } from '@/hooks/useReports';
import { useProfile } from '@/hooks/useProfile';
import { useProperties } from '@/hooks/useProperties';
import { useUiStore } from '@/stores/uiStore';
import { getCategoryLabel } from '@/utils/expense';
import { exportReportAsPDF } from '@/utils/export';
import { formatCurrency } from '@/utils/formatters';
import type {
  Language,
  ReportCategoryTypeFilter,
  ReportExpensePaymentStatus,
  ReportPeriod,
} from '@/types/app.types';

export default function ReportsScreen() {
  const { t, i18n } = useTranslation();
  const showToast = useUiStore((state) => state.showToast);
  const { profile } = useProfile();
  const { properties } = useProperties();
  const { categories } = useExpenseCategories();
  const floatingInset = useFloatingActionsInset();
  const contentTopPad =
    Platform.OS === 'ios'
      ? FLOATING_ACTIONS_ROW_HEIGHT + Spacing.md
      : floatingInset + Spacing.md;

  const [period, setPeriod] = useState<ReportPeriod>(() => buildReportPeriod('all_time'));
  const [propertyFilter, setPropertyFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [categoryTypeFilter, setCategoryTypeFilter] = useState<ReportCategoryTypeFilter>('all');
  const [expensePaymentStatus, setExpensePaymentStatus] =
    useState<ReportExpensePaymentStatus>('all');
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);

  const { report, isLoading, error, refetch } = useReports({
    period,
    propertyId: propertyFilter,
    categoryId: categoryFilter,
    categoryType: categoryTypeFilter,
    expensePaymentStatus,
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
        expensePaymentStatus,
      ),
    [categoryFilter, categoryTypeFilter, expensePaymentStatus, period, propertyFilter],
  );

  const downloadDisabled = !report || !hasData || exporting;

  const filterStateProps: ReportFiltersStateProps = {
    period,
    onPeriodChange: setPeriod,
    propertyFilter,
    onPropertyFilterChange: setPropertyFilter,
    categoryFilter,
    onCategoryFilterChange: setCategoryFilter,
    categoryTypeFilter,
    onCategoryTypeFilterChange: setCategoryTypeFilter,
    expensePaymentStatus,
    onExpensePaymentStatusChange: setExpensePaymentStatus,
    propertyOptions,
    categoryOptions,
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
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

  const wrap = (children: ReactNode) => (
    <View className="flex-1 bg-transparent" collapsable={false}>
      <ReportScreenActions
        activeFilterCount={activeFilterCount}
        onFilterPress={() => setFiltersVisible(true)}
        onDownloadPress={handleExport}
        downloadDisabled={downloadDisabled}
      />
      {children}
      <ReportFiltersSheetHost
        sheetVisible={filtersVisible}
        onSheetVisibleChange={setFiltersVisible}
        {...filterStateProps}
      />
    </View>
  );

  if (isLoading && !report) {
    return wrap(
      <View style={{ paddingTop: floatingInset }}>
        <SkeletonLoader count={4} height={120} style={styles.skeleton} />
      </View>,
    );
  }

  if (error && !report) {
    return wrap(<ErrorState message={error} onRetry={refetch} />);
  }

  if (!report || !hasData) {
    return wrap(
      <ScrollView
        style={styles.container}
        className="bg-transparent"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={[styles.content, styles.emptyContent, { paddingTop: contentTopPad }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <ReportActiveFilterChips {...filterStateProps} />
        <EmptyState
          icon={BarChart3}
          title={t('empty.noReports')}
          subtitle={t('empty.noReportsHint')}
        />
      </ScrollView>,
    );
  }

  return wrap(
    <FlatList
      style={styles.container}
      className="bg-transparent"
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={[
        styles.content,
        { paddingTop: contentTopPad, paddingBottom: Spacing.lg },
      ]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      data={report.propertySummaries}
      keyExtractor={(summary) => summary.propertyId}
      {...listPerformanceProps}
      renderItem={({ item: summary }) => (
        <AppCard style={styles.propertyCard}>
          <Text className="mb-2 text-lg font-medium">{summary.propertyName}</Text>
          <View style={styles.propertyStats}>
            <View style={styles.propertyStat}>
              <Text className="text-muted-foreground mb-0.5 text-[11px] uppercase tracking-wide">
                {t('reports.collected')}
              </Text>
              <Text className="text-base font-semibold" style={{ color: Colors.accent }}>
                {formatCurrency(summary.totalRentCollected, summary.currency, language)}
              </Text>
            </View>
            <View style={styles.propertyStat}>
              <Text className="text-muted-foreground mb-0.5 text-[11px] uppercase tracking-wide">
                {t('reports.spent')}
              </Text>
              <Text className="text-base font-semibold" style={{ color: Colors.danger }}>
                {formatCurrency(summary.totalExpensesPaid, summary.currency, language)}
              </Text>
            </View>
            <View style={styles.propertyStat}>
              <Text className="text-muted-foreground mb-0.5 text-[11px] uppercase tracking-wide">
                {t('reports.net')}
              </Text>
              <Text className="text-base font-semibold" style={{ color: Colors.primary }}>
                {formatCurrency(summary.net, summary.currency, language)}
              </Text>
            </View>
          </View>
        </AppCard>
      )}
      ListHeaderComponent={
        <View>
          <ReportActiveFilterChips {...filterStateProps} />

          {report.hasMixedCurrencies ? (
            <View style={styles.warningBanner}>
              <Text className="text-sm" style={{ color: '#92400E' }}>
                {t('reports.mixedCurrencyWarning')}
              </Text>
            </View>
          ) : null}

          <View style={styles.section}>
            <NetCashFlowChart
              data={report.monthlyIncomeExpense}
              netTotal={report.netIncome}
              currency={report.currency}
              language={language}
              comparison={report.comparison}
              expensePaymentStatus={report.expensePaymentStatus}
            />
          </View>

          <View style={styles.totalsRow}>
            <AppCard style={styles.totalCard}>
              <Text className="text-muted-foreground mb-1 text-[11px] uppercase tracking-wide">
                {t('reports.totalIncome')}
              </Text>
              <Text className="text-lg font-bold" style={{ color: Colors.accent }}>
                {formatCurrency(report.totalIncome, report.currency, language)}
              </Text>
            </AppCard>
            <AppCard style={styles.totalCard}>
              <Text className="text-muted-foreground mb-1 text-[11px] uppercase tracking-wide">
                {t('reports.totalExpenses')}
              </Text>
              <Text className="text-lg font-bold" style={{ color: Colors.danger }}>
                {formatCurrency(report.totalExpenses, report.currency, language)}
              </Text>
            </AppCard>
            <AppCard style={styles.totalCard}>
              <Text className="text-muted-foreground mb-1 text-[11px] uppercase tracking-wide">
                {t('reports.netTotal')}
              </Text>
              <Text className="text-lg font-bold" style={{ color: Colors.primary }}>
                {formatCurrency(report.netIncome, report.currency, language)}
              </Text>
            </AppCard>
          </View>

          <View style={styles.section}>
            <IncomeExpenseTrendChart
              data={report.monthlyIncomeExpense}
              currency={report.currency}
              language={language}
            />
          </View>

          <View style={styles.section}>
            <ExpenseBreakdown
              data={report.categoryBreakdown}
              currency={report.currency}
              language={language}
            />
          </View>

          <Text className="mb-2 text-lg font-medium">{t('reports.perProperty')}</Text>
        </View>
      }
      ListEmptyComponent={
        <EmptyState
          icon={BarChart3}
          title={t('empty.noReports')}
          subtitle={t('empty.noReportsHint')}
        />
      }
    />,
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.md,
  },
  emptyContent: {
    flexGrow: 1,
  },
  skeleton: {
    padding: Spacing.md,
  },
  section: {
    marginBottom: Spacing.md,
  },
  warningBanner: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  totalsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  totalCard: {
    flex: 1,
    padding: Spacing.sm,
    borderRadius: 16,
  },
  propertyCard: {
    marginBottom: Spacing.sm,
    borderRadius: 16,
  },
  propertyStats: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  propertyStat: {
    flex: 1,
  },
});
