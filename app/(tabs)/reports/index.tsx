import { format } from 'date-fns';
import { BarChart3, Share } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { ExpenseBreakdown } from '@/components/reports/ExpenseBreakdown';
import { IncomeExpenseTrendChart } from '@/components/reports/IncomeExpenseTrendChart';
import { NetCashFlowChart } from '@/components/reports/NetCashFlowChart';
import { PeriodFilter } from '@/components/reports/PeriodFilter';
import { PropertyIncomeShareChart } from '@/components/reports/PropertyIncomeShareChart';
import { PropertyNetChart } from '@/components/reports/PropertyNetChart';
import { ReportFilters } from '@/components/reports/ReportFilters';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import type { PickerOption } from '@/components/ui/AppPicker';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Icon } from '@/components/ui/icon';
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
import { formatCurrency } from '@/utils/formatters';
import type { Language, ReportCategoryTypeFilter, ReportPeriod } from '@/types/app.types';

export default function ReportsScreen() {
  const { t, i18n } = useTranslation();
  const showToast = useUiStore((state) => state.showToast);
  const { profile } = useProfile();
  const { properties } = useProperties();
  const { categories } = useExpenseCategories();

  const [period, setPeriod] = useState<ReportPeriod>(() => buildReportPeriod('all_time'));
  const [propertyFilter, setPropertyFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [categoryTypeFilter, setCategoryTypeFilter] = useState<ReportCategoryTypeFilter>('all');
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

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleExport = useCallback(async () => {
    if (!report) return;

    setExporting(true);
    try {
      const generatedAt = format(new Date(), 'dd.MM.yyyy HH:mm');
      const propertyRows = report.propertySummaries
        .map(
          (item) => `
            <tr>
              <td>${item.propertyName}</td>
              <td>${formatCurrency(item.totalRentCollected, item.currency, language)}</td>
              <td>${formatCurrency(item.totalExpensesPaid, item.currency, language)}</td>
              <td>${formatCurrency(item.net, item.currency, language)}</td>
            </tr>
          `,
        )
        .join('');

      const html = `
        <html>
          <head>
            <meta charset="utf-8" />
            <style>
              body { font-family: sans-serif; padding: 24px; color: #0F172A; }
              h1 { font-size: 22px; margin-bottom: 8px; }
              h2 { font-size: 16px; margin-top: 24px; }
              table { width: 100%; border-collapse: collapse; margin-top: 12px; }
              th, td { border: 1px solid #E2E8F0; padding: 8px; text-align: left; font-size: 12px; }
              th { background: #F8FAFC; }
              .summary { display: flex; gap: 16px; margin-top: 16px; }
              .card { flex: 1; border: 1px solid #E2E8F0; border-radius: 8px; padding: 12px; }
            </style>
          </head>
          <body>
            <h1>${t('reports.title')}</h1>
            <p>${t('reports.generatedAt', { date: generatedAt })}</p>
            <p>${report.period.startDate} – ${report.period.endDate}</p>
            <div class="summary">
              <div class="card"><strong>${t('reports.totalIncome')}</strong><br/>${formatCurrency(report.totalIncome, report.currency, language)}</div>
              <div class="card"><strong>${t('reports.totalExpenses')}</strong><br/>${formatCurrency(report.totalExpenses, report.currency, language)}</div>
              <div class="card"><strong>${t('reports.netTotal')}</strong><br/>${formatCurrency(report.netIncome, report.currency, language)}</div>
            </div>
            <h2>${t('reports.perProperty')}</h2>
            <table>
              <thead>
                <tr>
                  <th>${t('properties.property')}</th>
                  <th>${t('reports.collected')}</th>
                  <th>${t('reports.spent')}</th>
                  <th>${t('reports.net')}</th>
                </tr>
              </thead>
              <tbody>${propertyRows}</tbody>
            </table>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      }
      showToast({ message: t('reports.exportSuccess'), type: 'success' });
    } catch (err) {
      showToast({
        message: err instanceof Error ? err.message : t('reports.exportFailed'),
        type: 'error',
      });
    } finally {
      setExporting(false);
    }
  }, [language, period.endDate, period.startDate, report, showToast, t]);

  if (isLoading && !report) {
    return (
      <View style={styles.container} className="bg-background">
        <SkeletonLoader count={4} height={120} style={styles.skeleton} />
      </View>
    );
  }

  if (error && !report) {
    return (
      <View style={styles.container} className="bg-background">
        <ErrorState message={error} onRetry={refetch} />
      </View>
    );
  }

  if (!report || !hasData) {
    return (
      <ScrollView
        style={styles.container}
        className="bg-background"
        contentContainerStyle={[styles.content, styles.emptyContent]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <PeriodFilter value={period} onChange={setPeriod} />
        <ReportFilters
          propertyFilter={propertyFilter}
          onPropertyFilterChange={setPropertyFilter}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={setCategoryFilter}
          categoryTypeFilter={categoryTypeFilter}
          onCategoryTypeFilterChange={setCategoryTypeFilter}
          propertyOptions={propertyOptions}
          categoryOptions={categoryOptions}
        />
        <EmptyState
          icon={BarChart3}
          title={t('empty.noReports')}
          subtitle={t('empty.noReportsHint')}
        />
      </ScrollView>
    );
  }

  return (
    <FlatList
      style={styles.container}
      className="bg-background"
      contentContainerStyle={[styles.content, { paddingBottom: Spacing.lg }]}
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
          <PeriodFilter value={period} onChange={setPeriod} />
          <ReportFilters
            propertyFilter={propertyFilter}
            onPropertyFilterChange={setPropertyFilter}
            categoryFilter={categoryFilter}
            onCategoryFilterChange={setCategoryFilter}
            categoryTypeFilter={categoryTypeFilter}
            onCategoryTypeFilterChange={setCategoryTypeFilter}
            propertyOptions={propertyOptions}
            categoryOptions={categoryOptions}
          />

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

          <View style={styles.section}>
            <PropertyNetChart data={report.propertySummaries} language={language} />
          </View>

          <View style={styles.section}>
            <PropertyIncomeShareChart
              data={report.propertySummaries}
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
      ListFooterComponent={
        <AppButton
          mode="contained"
          loading={exporting}
          onPress={handleExport}
          style={styles.exportButton}
        >
          <View className="flex-row items-center gap-2">
            <Icon as={Share} size={18} className="text-primary-foreground" />
            <Text className="text-primary-foreground">{t('reports.export')}</Text>
          </View>
        </AppButton>
      }
    />
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
  exportButton: {
    marginTop: Spacing.md,
  },
});
