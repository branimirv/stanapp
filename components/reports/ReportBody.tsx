import { BarChart3, Plus } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ExpenseBreakdown } from '@/components/reports/ExpenseBreakdown';
import { NetCashFlowChart } from '@/components/reports/NetCashFlowChart';
import { PropertyNetList } from '@/components/reports/PropertyNetList';
import { ReportSummaryBays } from '@/components/reports/ReportSummaryBays';
import { EmptyState } from '@/components/ui/EmptyState';
import type { Language, ReportData } from '@/types/app.types';

type ReportBodyProps = {
  report: ReportData | null | undefined;
  hasData: boolean;
  showPerProperty: boolean;
  language: Language;
  onAddExpense: () => void;
};

/** Chart, summary bays, breakdown — or empty CTA when the report has no data. */
export function ReportBody({
  report,
  hasData,
  showPerProperty,
  language,
  onAddExpense,
}: ReportBodyProps) {
  const { t } = useTranslation();

  if (!report || !hasData) {
    return (
      <EmptyState
        icon={BarChart3}
        title={t('empty.noReports')}
        subtitle={t('empty.noReportsHint')}
        ctaLabel={t('expenses.addNew')}
        ctaIcon={Plus}
        onCtaPress={onAddExpense}
        className="mt-1"
      />
    );
  }

  return (
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

      <ReportSummaryBays
        incomeLabel={t('reports.incomeBay')}
        expenseLabel={t('reports.expenseBay')}
        netLabel={t('reports.netBay')}
        totalIncome={report.totalIncome}
        totalExpenses={report.totalExpenses}
        netIncome={report.netIncome}
        currency={report.currency}
        language={language}
      />

      {showPerProperty ? (
        <PropertyNetList summaries={report.propertySummaries} language={language} />
      ) : null}

      <ExpenseBreakdown
        data={report.categoryBreakdown}
        currency={report.currency}
        language={language}
        style={{ marginTop: 22, marginBottom: 8 }}
      />
    </>
  );
}
