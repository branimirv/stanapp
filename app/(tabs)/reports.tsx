import { format } from 'date-fns';
import { BarChart3 } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useGlassTabBarInset } from '@/hooks/useGlassTabBarInset';
import { useDefaultTabHeader } from '@/hooks/useDefaultTabHeader';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { ExpenseBreakdown } from '@/components/reports/ExpenseBreakdown';
import { IncomeExpenseChart } from '@/components/reports/IncomeExpenseChart';
import { PeriodFilter } from '@/components/reports/PeriodFilter';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { buildReportPeriod, useReports } from '@/hooks/useReports';
import { useProfile } from '@/hooks/useProfile';
import { useUiStore } from '@/stores/uiStore';
import { formatCurrency } from '@/utils/formatters';
import type { Language, ReportPeriod } from '@/types/app.types';

export default function ReportsScreen() {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const { scrollPadding } = useGlassTabBarInset();
  useDefaultTabHeader();
  const showToast = useUiStore((state) => state.showToast);
  const { profile } = useProfile();

  const [period, setPeriod] = useState<ReportPeriod>(() => buildReportPeriod('current_month'));
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);

  const { report, isLoading, error, refetch } = useReports({ period });
  const language = (profile?.language ?? i18n.language ?? 'hr') as Language;

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
            <p>${period.startDate} – ${period.endDate}</p>
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
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <SkeletonLoader count={4} height={120} style={styles.skeleton} />
      </View>
    );
  }

  if (error && !report) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ErrorState message={error} onRetry={refetch} />
      </View>
    );
  }

  if (!report || !hasData) {
    return (
      <ScrollView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={[styles.content, styles.emptyContent]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <PeriodFilter value={period} onChange={setPeriod} />
        <EmptyState
          icon={BarChart3}
          title={t('empty.noReports')}
          subtitle={t('empty.noReportsHint')}
        />
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={[styles.content, { paddingBottom: scrollPadding }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <PeriodFilter value={period} onChange={setPeriod} />

      {report.hasMixedCurrencies ? (
        <View style={styles.warningBanner}>
          <Text style={styles.warningText}>{t('reports.mixedCurrencyWarning')}</Text>
        </View>
      ) : null}

      <View style={styles.totalsRow}>
        <AppCard style={styles.totalCard}>
          <Text style={[styles.totalLabel, { color: theme.colors.onSurfaceVariant }]}>
            {t('reports.totalIncome')}
          </Text>
          <Text style={[styles.totalValue, { color: Colors.accent }]}>
            {formatCurrency(report.totalIncome, report.currency, language)}
          </Text>
        </AppCard>
        <AppCard style={styles.totalCard}>
          <Text style={[styles.totalLabel, { color: theme.colors.onSurfaceVariant }]}>
            {t('reports.totalExpenses')}
          </Text>
          <Text style={[styles.totalValue, { color: Colors.danger }]}>
            {formatCurrency(report.totalExpenses, report.currency, language)}
          </Text>
        </AppCard>
        <AppCard style={styles.totalCard}>
          <Text style={[styles.totalLabel, { color: theme.colors.onSurfaceVariant }]}>
            {t('reports.netTotal')}
          </Text>
          <Text style={[styles.totalValue, { color: theme.colors.primary }]}>
            {formatCurrency(report.netIncome, report.currency, language)}
          </Text>
        </AppCard>
      </View>

      <View style={styles.section}>
        <IncomeExpenseChart data={report.monthlyIncomeExpense} />
      </View>

      <View style={styles.section}>
        <ExpenseBreakdown
          data={report.categoryBreakdown}
          currency={report.currency}
          language={language}
        />
      </View>

      <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
        {t('reports.perProperty')}
      </Text>

      {report.propertySummaries.map((summary) => (
        <AppCard key={summary.propertyId} style={styles.propertyCard}>
          <Text style={[styles.propertyName, { color: theme.colors.onSurface }]}>
            {summary.propertyName}
          </Text>
          <View style={styles.propertyStats}>
            <View style={styles.propertyStat}>
              <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                {t('reports.collected')}
              </Text>
              <Text style={[styles.statValue, { color: Colors.accent }]}>
                {formatCurrency(summary.totalRentCollected, summary.currency, language)}
              </Text>
            </View>
            <View style={styles.propertyStat}>
              <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                {t('reports.spent')}
              </Text>
              <Text style={[styles.statValue, { color: Colors.danger }]}>
                {formatCurrency(summary.totalExpensesPaid, summary.currency, language)}
              </Text>
            </View>
            <View style={styles.propertyStat}>
              <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                {t('reports.net')}
              </Text>
              <Text style={[styles.statValue, { color: theme.colors.primary }]}>
                {formatCurrency(summary.net, summary.currency, language)}
              </Text>
            </View>
          </View>
        </AppCard>
      ))}

      <AppButton
        mode="contained"
        icon="export"
        loading={exporting}
        onPress={handleExport}
        style={styles.exportButton}
      >
        {t('reports.export')}
      </AppButton>
    </ScrollView>
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
  warningText: {
    ...Typography.bodySmall,
    color: '#92400E',
  },
  totalsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  totalCard: {
    flex: 1,
    padding: Spacing.sm,
  },
  totalLabel: {
    ...Typography.labelSmall,
    marginBottom: Spacing.xs,
  },
  totalValue: {
    ...Typography.titleMedium,
  },
  sectionTitle: {
    ...Typography.titleMedium,
    marginBottom: Spacing.sm,
  },
  propertyCard: {
    marginBottom: Spacing.sm,
  },
  propertyName: {
    ...Typography.titleMedium,
    marginBottom: Spacing.sm,
  },
  propertyStats: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  propertyStat: {
    flex: 1,
  },
  statLabel: {
    ...Typography.labelSmall,
    marginBottom: 2,
  },
  statValue: {
    ...Typography.bodyMedium,
  },
  exportButton: {
    marginTop: Spacing.md,
  },
});
