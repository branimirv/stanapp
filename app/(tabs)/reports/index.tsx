import { parseISO } from 'date-fns';
import { BarChart3, Download } from 'lucide-react-native';
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
import { APP_BOTTOM_SHEET_CLOSE_MS } from '@/components/ui/AppBottomSheet';
import type { PickerOption } from '@/components/ui/AppPicker';
import { BlurOverlay } from '@/components/ui/BlurOverlay';
import { DisplayAmount } from '@/components/ui/DisplayAmount';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { FilterIconButton } from '@/components/ui/FilterIconButton';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { Spacing } from '@/constants/theme';
import { useExpenseCategories } from '@/hooks/useExpenseCategories';
import { buildReportPeriod, useReports } from '@/hooks/useReports';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useProfile } from '@/hooks/useProfile';
import { useProperties } from '@/hooks/useProperties';
import { displayFontFamily, Fonts } from '@/lib/fonts';
import { useTabBarStore } from '@/stores/tabBarStore';
import { useUiStore } from '@/stores/uiStore';
import { getCategoryLabel } from '@/utils/expense';
import { exportReportAsPDF } from '@/utils/export';
import { formatMonthName, formatPeriod } from '@/utils/formatters';
import type {
  Language,
  ReportCategoryTypeFilter,
  ReportExpensePaymentStatus,
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
  const { colors, elevation, radius } = theme;
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
    expensePaymentStatus,
    onExpensePaymentStatusChange: setExpensePaymentStatus,
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

  if (isLoading && !report) {
    return (
      <View style={styles.container} className="bg-transparent">
        <SkeletonLoader count={5} height={120} style={styles.skeleton} />
      </View>
    );
  }

  if (error && !report) {
    return (
      <View style={styles.container} className="bg-transparent">
        <ErrorState message={error} onRetry={refetch} />
      </View>
    );
  }

  return (
    <View style={styles.container} className="bg-transparent" collapsable={false}>
      <ScrollView
        style={styles.scroll}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={[
          styles.content,
          {
            paddingHorizontal: theme.spacing.gutter,
            paddingBottom: Spacing.scrollBottom,
          },
        ]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topRow}>
          <FilterIconButton
            activeCount={activeFilterCount}
            onPress={() => handleFiltersVisibleChange(true)}
            accessibilityLabel={
              activeFilterCount > 0
                ? t('reports.filtersWithCount', { count: activeFilterCount })
                : t('reports.filters')
            }
          />
          <Pressable
            onPress={handleExport}
            disabled={downloadDisabled}
            accessibilityRole="button"
            accessibilityLabel={t('reports.export')}
            style={[
              styles.btnIco,
              {
                backgroundColor: colors.surface2,
                opacity: downloadDisabled ? 0.45 : 1,
              },
            ]}
            hitSlop={4}
          >
            <Download size={17} color={colors.fg} strokeWidth={2} />
          </Pressable>
        </View>

        <View style={styles.titleBlk}>
          <Text
            style={{
              fontFamily: Fonts.sans.semibold,
              fontSize: 11,
              lineHeight: 14,
              letterSpacing: 1.54,
              textTransform: 'uppercase',
              color: colors.muted,
              marginBottom: 10,
            }}
          >
            {periodEyebrow}
          </Text>
          <Text
            style={{
              fontFamily: displayFontFamily(theme.name),
              fontSize: 34,
              lineHeight: 34,
              letterSpacing: -0.85,
              color: colors.fg,
            }}
          >
            {t('reports.title')}
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.pillBleed}
          contentContainerStyle={[
            styles.pillRow,
            { paddingHorizontal: theme.spacing.gutter },
          ]}
        >
          <Pressable
            onPress={() => handlePropertyPill('all')}
            style={[
              styles.pill,
              {
                backgroundColor:
                  propertyFilter === 'all' ? colors.primaryTint : colors.surface2,
              },
            ]}
            accessibilityRole="button"
            accessibilityState={{ selected: propertyFilter === 'all' }}
          >
            <Text
              style={{
                fontFamily: Fonts.sans.semibold,
                fontSize: 13,
                color: propertyFilter === 'all' ? colors.primary : colors.muted,
              }}
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
                style={[
                  styles.pill,
                  {
                    backgroundColor: on ? colors.primaryTint : colors.surface2,
                  },
                ]}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
              >
                <Text
                  style={{
                    fontFamily: Fonts.sans.semibold,
                    fontSize: 13,
                    color: on ? colors.primary : colors.muted,
                  }}
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
          />
        ) : (
          <>
            {report.hasMixedCurrencies ? (
              <View
                style={[
                  styles.warningBanner,
                  { backgroundColor: colors.surface2, borderColor: colors.bd },
                ]}
              >
                <Text
                  style={{
                    fontFamily: Fonts.sans.regular,
                    fontSize: 13,
                    color: colors.muted,
                  }}
                >
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
              expensePaymentStatus={report.expensePaymentStatus}
            />

            <View
              style={[
                styles.bays,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.cardBd,
                  borderRadius: radius.xl,
                  ...elevation.card,
                },
              ]}
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
                <View key={bay.label} style={styles.bayCell}>
                  {index > 0 ? (
                    <View style={[styles.bayDivider, { backgroundColor: colors.bd }]} />
                  ) : null}
                  <View style={styles.bay}>
                    <Text
                      style={{
                        fontFamily: Fonts.sans.semibold,
                        fontSize: 10,
                        letterSpacing: 0.8,
                        textTransform: 'uppercase',
                        color: colors.muted,
                        marginBottom: 9,
                      }}
                    >
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
              style={styles.breakdown}
            />
          </>
        )}
      </ScrollView>

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingTop: 0,
  },
  skeleton: {
    padding: Spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  btnIco: {
    width: 38,
    height: 38,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBlk: {
    marginBottom: 16,
  },
  pillBleed: {
    marginHorizontal: -17,
    marginBottom: 10,
  },
  pillRow: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 1,
  },
  pill: {
    height: 34,
    paddingHorizontal: 14,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  warningBanner: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    marginBottom: 12,
  },
  bays: {
    flexDirection: 'row',
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 20,
    overflow: 'hidden',
  },
  bayCell: {
    flex: 1,
    flexDirection: 'row',
  },
  bayDivider: {
    width: StyleSheet.hairlineWidth,
  },
  bay: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  breakdown: {
    marginTop: 22,
    marginBottom: 8,
  },
});
