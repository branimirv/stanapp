import { eachMonthOfInterval, endOfMonth, format, startOfMonth } from 'date-fns';
import { resolveCurrency } from '@/utils/currency';
import { getCategoryEffectiveType } from '@/utils/expense';
import { buildPreviousReportPeriod } from '@/utils/reportPeriod';
import type {
  CategoryBreakdown,
  ExpenseCategory,
  MonthlyIncomeExpense,
  Profile,
  Property,
  PropertyReportSummary,
  ReportCategoryTypeFilter,
  ReportData,
  ReportPeriod,
  ReportPeriodComparison,
} from '@/types/app.types';

export type RentRow = {
  amount: number | string;
  currency: string | null;
  property_id: string;
  period_month: number;
  period_year: number;
  status: string;
};

export type ExpenseRow = {
  amount: number | string;
  currency: string | null;
  property_id: string;
  category_id: string;
  billing_date: string;
  paid_at: string | null;
};

export function resolveFilterId(value?: string): string | undefined {
  if (!value || value === 'all') return undefined;
  return value;
}

export function collectCurrencies(
  rows: Array<{ currency: string | null }>,
  properties: Property[],
  profileCurrency: string,
): string[] {
  const currencies = new Set<string>();

  for (const row of rows) {
    currencies.add(row.currency ?? profileCurrency);
  }

  for (const property of properties) {
    if (property.currency) {
      currencies.add(property.currency);
    }
  }

  return [...currencies];
}

export function inBillingRange(
  billingDate: string,
  startDate: string,
  endDate: string,
): boolean {
  return billingDate >= startDate && billingDate <= endDate;
}

export function rentInRange(payments: RentRow[], start: Date, end: Date): RentRow[] {
  const rangeStart = startOfMonth(start);
  const rangeEnd = endOfMonth(end);
  return payments.filter((payment) => {
    const paymentDate = new Date(payment.period_year, payment.period_month - 1, 1);
    return paymentDate >= rangeStart && paymentDate <= rangeEnd;
  });
}

export function sumAmounts(rows: Array<{ amount: number | string }>): number {
  return rows.reduce((sum, row) => sum + Number(row.amount), 0);
}

export function buildComparison(
  currentNet: number,
  previousNet: number,
  previousPeriod: { startDate: string; endDate: string },
): ReportPeriodComparison {
  const deltaAbsolute = currentNet - previousNet;
  let deltaPercent: number | null;
  if (previousNet === 0) {
    deltaPercent = currentNet === 0 ? 0 : null;
  } else {
    deltaPercent = (deltaAbsolute / Math.abs(previousNet)) * 100;
  }

  return {
    previousNet,
    deltaAbsolute,
    deltaPercent,
    previousPeriod,
  };
}

export interface AggregateReportDataParams {
  period: ReportPeriod;
  profile: Profile | null;
  properties: Property[];
  categories: ExpenseCategory[];
  rentRows: RentRow[];
  expenseRows: ExpenseRow[];
  propertyId?: string;
  categoryId?: string;
  categoryType?: ReportCategoryTypeFilter;
}

/** Shape ReportData from already-fetched rows (no I/O). */
export function aggregateReportData({
  period,
  profile,
  properties: rawProperties,
  categories,
  rentRows,
  expenseRows,
  propertyId: rawPropertyId,
  categoryId: rawCategoryId,
  categoryType = 'all',
}: AggregateReportDataParams): ReportData {
  const propertyId = resolveFilterId(rawPropertyId);
  const categoryId = resolveFilterId(rawCategoryId);
  const previousPeriod = buildPreviousReportPeriod(period);

  const endDate = period.endDate;
  let start = new Date(period.startDate);
  const end = new Date(endDate);

  const categoryMap = new Map<string, ExpenseCategory>(
    categories.map((category) => [category.id, category]),
  );

  const defaultCurrency = profile?.default_currency ?? 'EUR';

  let properties = rawProperties;
  if (propertyId) {
    properties = properties.filter((property) => property.id === propertyId);
  }

  let allRent = rentRows;
  if (propertyId) {
    allRent = allRent.filter((payment) => payment.property_id === propertyId);
  }

  let allExpenses = expenseRows;
  if (propertyId) {
    allExpenses = allExpenses.filter((expense) => expense.property_id === propertyId);
  }

  if (period.preset === 'all_time') {
    const earliestTimestamps: number[] = [];
    for (const expense of allExpenses) {
      if (inBillingRange(expense.billing_date, period.startDate, endDate)) {
        earliestTimestamps.push(new Date(expense.billing_date).getTime());
      }
    }
    for (const payment of rentInRange(allRent, start, end)) {
      earliestTimestamps.push(new Date(payment.period_year, payment.period_month - 1, 1).getTime());
    }
    start = earliestTimestamps.length
      ? startOfMonth(new Date(Math.min(...earliestTimestamps)))
      : startOfMonth(end);
  }

  const effectiveStartDate = format(start, 'yyyy-MM-dd');
  const effectiveEndDate = endDate;

  const rentInPeriod = rentInRange(allRent, start, end);
  const cashFlowExpenses = allExpenses.filter((expense) =>
    inBillingRange(expense.billing_date, effectiveStartDate, effectiveEndDate),
  );

  let analysisExpenses = cashFlowExpenses;
  if (categoryId) {
    analysisExpenses = analysisExpenses.filter((expense) => expense.category_id === categoryId);
  }
  if (categoryType !== 'all') {
    analysisExpenses = analysisExpenses.filter((expense) => {
      const category = categoryMap.get(expense.category_id);
      return category ? getCategoryEffectiveType(category) === categoryType : false;
    });
  }

  const allCurrencyRows = [
    ...rentInPeriod.map((row) => ({ currency: row.currency })),
    ...cashFlowExpenses.map((row) => ({ currency: row.currency })),
  ];
  const currenciesFound = collectCurrencies(allCurrencyRows, properties, defaultCurrency);
  const hasMixedCurrencies = currenciesFound.length > 1;

  const months = eachMonthOfInterval({ start, end });
  const monthlyIncomeExpense: MonthlyIncomeExpense[] = months.map((monthDate) => {
    const month = monthDate.getMonth() + 1;
    const year = monthDate.getFullYear();

    const income = rentInPeriod
      .filter((payment) => payment.period_month === month && payment.period_year === year)
      .reduce((sum, payment) => sum + Number(payment.amount), 0);

    const monthStart = format(startOfMonth(monthDate), 'yyyy-MM-dd');
    const monthEnd = format(endOfMonth(monthDate), 'yyyy-MM-dd');

    const expenses = cashFlowExpenses
      .filter((expense) => expense.billing_date >= monthStart && expense.billing_date <= monthEnd)
      .reduce((sum, expense) => sum + Number(expense.amount), 0);

    return {
      month,
      year,
      label: format(monthDate, 'MMM yyyy'),
      income,
      expenses,
      net: income - expenses,
    };
  });

  const categoryTotals = new Map<string, number>();
  for (const expense of analysisExpenses) {
    const current = categoryTotals.get(expense.category_id) ?? 0;
    categoryTotals.set(expense.category_id, current + Number(expense.amount));
  }

  const analysisExpensesTotal = sumAmounts(analysisExpenses);
  const categoryBreakdown: CategoryBreakdown[] = [...categoryTotals.entries()]
    .map(([categoryIdKey, amount]) => {
      const category = categoryMap.get(categoryIdKey);
      return {
        categoryId: categoryIdKey,
        categoryKey: category?.key ?? 'other',
        categoryName: category?.name ?? null,
        icon: category?.icon ?? 'MoreHorizontal',
        color: category?.color ?? '#6B7280',
        amount,
        percentage: analysisExpensesTotal > 0 ? (amount / analysisExpensesTotal) * 100 : 0,
      };
    })
    .sort((a, b) => b.amount - a.amount);

  const propertySummaries: PropertyReportSummary[] = properties.map((property) => {
    const propertyCurrency = resolveCurrency(profile, property, property.currency);
    const totalRentCollected = rentInPeriod
      .filter((payment) => payment.property_id === property.id)
      .reduce((sum, payment) => sum + Number(payment.amount), 0);

    const totalExpensesPaid = cashFlowExpenses
      .filter((expense) => expense.property_id === property.id)
      .reduce((sum, expense) => sum + Number(expense.amount), 0);

    return {
      propertyId: property.id,
      propertyName: property.name,
      totalRentCollected,
      totalExpensesPaid,
      net: totalRentCollected - totalExpensesPaid,
      currency: propertyCurrency,
    };
  });

  const totalIncome = sumAmounts(rentInPeriod);
  const totalExpenses = sumAmounts(cashFlowExpenses);
  const netIncome = totalIncome - totalExpenses;

  let comparison: ReportPeriodComparison | null = null;
  if (previousPeriod) {
    const prevStart = new Date(previousPeriod.startDate);
    const prevEnd = new Date(previousPeriod.endDate);
    const prevRent = rentInRange(allRent, prevStart, prevEnd);
    const prevExpenses = allExpenses.filter((expense) =>
      inBillingRange(expense.billing_date, previousPeriod.startDate, previousPeriod.endDate),
    );
    const previousNet = sumAmounts(prevRent) - sumAmounts(prevExpenses);
    comparison = buildComparison(netIncome, previousNet, previousPeriod);
  }

  return {
    period: { ...period, startDate: effectiveStartDate },
    currency: defaultCurrency,
    hasMixedCurrencies,
    currenciesFound,
    monthlyIncomeExpense,
    categoryBreakdown,
    propertySummaries,
    totalIncome,
    totalExpenses,
    netIncome,
    comparison,
  };
}
