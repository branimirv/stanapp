import {
  differenceInCalendarDays,
  eachMonthOfInterval,
  endOfMonth,
  format,
  startOfMonth,
  subDays,
  subMonths,
} from 'date-fns';
import { supabase } from '@/lib/supabase';
import { resolveCurrency } from '@/utils/currency';
import { getCategoryEffectiveType } from '@/utils/expense';
import { throwQueryError } from '@/utils/errors';
import type {
  CategoryBreakdown,
  ExpenseCategory,
  MonthlyIncomeExpense,
  Property,
  PropertyReportSummary,
  ReportCategoryTypeFilter,
  ReportData,
  ReportPeriod,
  ReportPeriodComparison,
  ReportPeriodPreset,
} from '@/types/app.types';

const ALL_TIME_START = '1970-01-01';

/** True when a custom "Od" can be shown in the date picker (not empty / all-time sentinel). */
export function isUsableCustomStartDate(value: string | null | undefined): boolean {
  if (!value) return false;
  if (value <= ALL_TIME_START) return false;
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
}

function currentMonthBounds(now = new Date()): { startDate: string; endDate: string } {
  return {
    startDate: format(startOfMonth(now), 'yyyy-MM-dd'),
    endDate: format(endOfMonth(now), 'yyyy-MM-dd'),
  };
}

/**
 * Resolve Custom period dates per ADR 002: carry forward when possible,
 * otherwise seed Od from first financial activity (or current month).
 */
export function resolveCustomReportPeriod(options: {
  carryStart?: string;
  carryEnd?: string;
  fromPreset?: ReportPeriodPreset;
  earliestActivityDate?: string | null;
  forceReseedStart?: boolean;
}): ReportPeriod {
  const now = new Date();
  const month = currentMonthBounds(now);
  const fallbackStart = options.earliestActivityDate ?? month.startDate;

  const canCarryStart =
    !options.forceReseedStart &&
    options.fromPreset !== 'all_time' &&
    isUsableCustomStartDate(options.carryStart);

  let startDate = canCarryStart ? options.carryStart! : fallbackStart;
  let endDate =
    options.carryEnd && isUsableCustomStartDate(options.carryEnd)
      ? options.carryEnd
      : month.endDate;

  if (endDate < startDate) {
    endDate = month.endDate < startDate ? startDate : month.endDate;
  }

  return {
    preset: 'custom',
    startDate,
    endDate,
  };
}

/**
 * Earliest cash-flow date for the portfolio or one property:
 * min(paid rent month-start, expense billing_date).
 */
export async function fetchEarliestReportActivityDate(
  propertyId?: string,
): Promise<string | null> {
  const resolvedPropertyId =
    propertyId && propertyId !== 'all' ? propertyId : undefined;

  let expensesQuery = supabase
    .from('expenses')
    .select('billing_date')
    .order('billing_date', { ascending: true })
    .limit(1);
  let rentQuery = supabase
    .from('rent_payments')
    .select('period_year, period_month')
    .eq('status', 'paid')
    .order('period_year', { ascending: true })
    .order('period_month', { ascending: true })
    .limit(1);

  if (resolvedPropertyId) {
    expensesQuery = expensesQuery.eq('property_id', resolvedPropertyId);
    rentQuery = rentQuery.eq('property_id', resolvedPropertyId);
  }

  const [expensesResult, rentResult] = await Promise.all([expensesQuery, rentQuery]);
  if (expensesResult.error) throwQueryError(expensesResult.error);
  if (rentResult.error) throwQueryError(rentResult.error);

  const timestamps: number[] = [];

  const earliestExpense = expensesResult.data?.[0]?.billing_date;
  if (earliestExpense) {
    timestamps.push(new Date(earliestExpense).getTime());
  }

  const earliestRent = rentResult.data?.[0];
  if (earliestRent) {
    timestamps.push(
      new Date(earliestRent.period_year, earliestRent.period_month - 1, 1).getTime(),
    );
  }

  if (timestamps.length === 0) return null;
  return format(startOfMonth(new Date(Math.min(...timestamps))), 'yyyy-MM-dd');
}

type RentRow = {
  amount: number | string;
  currency: string | null;
  property_id: string;
  period_month: number;
  period_year: number;
  status: string;
};

type ExpenseRow = {
  amount: number | string;
  currency: string | null;
  property_id: string;
  category_id: string;
  billing_date: string;
  paid_at: string | null;
};

export function buildDefaultReportPeriod(): ReportPeriod {
  const now = new Date();
  return {
    preset: 'all_time',
    startDate: ALL_TIME_START,
    endDate: format(endOfMonth(now), 'yyyy-MM-dd'),
  };
}

export function buildReportPeriod(
  preset: ReportPeriodPreset,
  customStart?: string,
  customEnd?: string,
): ReportPeriod {
  const now = new Date();

  switch (preset) {
    case 'all_time':
      return {
        preset,
        startDate: ALL_TIME_START,
        endDate: format(endOfMonth(now), 'yyyy-MM-dd'),
      };
    case 'current_month':
      return {
        preset,
        startDate: format(startOfMonth(now), 'yyyy-MM-dd'),
        endDate: format(endOfMonth(now), 'yyyy-MM-dd'),
      };
    case 'last_3_months':
      return {
        preset,
        startDate: format(startOfMonth(subMonths(now, 2)), 'yyyy-MM-dd'),
        endDate: format(endOfMonth(now), 'yyyy-MM-dd'),
      };
    case 'last_6_months':
      return {
        preset,
        startDate: format(startOfMonth(subMonths(now, 5)), 'yyyy-MM-dd'),
        endDate: format(endOfMonth(now), 'yyyy-MM-dd'),
      };
    case 'last_12_months':
      return {
        preset,
        startDate: format(startOfMonth(subMonths(now, 11)), 'yyyy-MM-dd'),
        endDate: format(endOfMonth(now), 'yyyy-MM-dd'),
      };
    case 'custom':
      return {
        preset,
        startDate: customStart ?? format(startOfMonth(now), 'yyyy-MM-dd'),
        endDate: customEnd ?? format(endOfMonth(now), 'yyyy-MM-dd'),
      };
  }
}

/** Equal-length window ending the day before the selected period starts. */
export function buildPreviousReportPeriod(
  period: ReportPeriod,
): { startDate: string; endDate: string } | null {
  if (period.preset === 'all_time') return null;

  const start = new Date(period.startDate);
  const end = new Date(period.endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
    return null;
  }

  const daySpan = differenceInCalendarDays(end, start);
  const prevEnd = subDays(start, 1);
  const prevStart = subDays(prevEnd, daySpan);

  return {
    startDate: format(prevStart, 'yyyy-MM-dd'),
    endDate: format(prevEnd, 'yyyy-MM-dd'),
  };
}

function collectCurrencies(
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

function resolveFilterId(value?: string): string | undefined {
  if (!value || value === 'all') return undefined;
  return value;
}

function inBillingRange(billingDate: string, startDate: string, endDate: string): boolean {
  return billingDate >= startDate && billingDate <= endDate;
}

function rentInRange(payments: RentRow[], start: Date, end: Date): RentRow[] {
  const rangeStart = startOfMonth(start);
  const rangeEnd = endOfMonth(end);
  return payments.filter((payment) => {
    const paymentDate = new Date(payment.period_year, payment.period_month - 1, 1);
    return paymentDate >= rangeStart && paymentDate <= rangeEnd;
  });
}

function sumAmounts(rows: Array<{ amount: number | string }>): number {
  return rows.reduce((sum, row) => sum + Number(row.amount), 0);
}

function buildComparison(
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

export interface FetchReportDataParams {
  userId: string;
  period: ReportPeriod;
  propertyId?: string;
  categoryId?: string;
  categoryType?: ReportCategoryTypeFilter;
}

export async function fetchReportData({
  userId,
  period,
  propertyId: rawPropertyId,
  categoryId: rawCategoryId,
  categoryType = 'all',
}: FetchReportDataParams): Promise<ReportData> {
  const propertyId = resolveFilterId(rawPropertyId);
  const categoryId = resolveFilterId(rawCategoryId);
  const previousPeriod = buildPreviousReportPeriod(period);

  const endDate = period.endDate;
  let start = new Date(period.startDate);
  const end = new Date(endDate);

  const fetchStartDate = previousPeriod?.startDate ?? period.startDate;
  const fetchStart = new Date(fetchStartDate);

  const [profileResult, propertiesResult, categoriesResult, rentResult, expensesResult] =
    await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase.from('properties').select('*').eq('is_archived', false),
      supabase.from('expense_categories').select('*'),
      supabase
        .from('rent_payments')
        .select('*')
        .eq('status', 'paid')
        .gte('period_year', fetchStart.getFullYear())
        .lte('period_year', end.getFullYear()),
      supabase
        .from('expenses')
        .select('*')
        .gte('billing_date', fetchStartDate)
        .lte('billing_date', endDate),
    ]);

  const queryError =
    profileResult.error ??
    propertiesResult.error ??
    categoriesResult.error ??
    rentResult.error ??
    expensesResult.error;

  if (queryError) throwQueryError(queryError);

  const profile = profileResult.data;
  const categories = (categoriesResult.data ?? []) as ExpenseCategory[];
  const categoryMap = new Map<string, ExpenseCategory>(
    categories.map((category) => [category.id, category]),
  );

  const defaultCurrency = profile?.default_currency ?? 'EUR';

  let properties = (propertiesResult.data ?? []) as Property[];
  if (propertyId) {
    properties = properties.filter((property) => property.id === propertyId);
  }

  let allRent = (rentResult.data ?? []) as RentRow[];
  if (propertyId) {
    allRent = allRent.filter((payment) => payment.property_id === propertyId);
  }

  let allExpenses = (expensesResult.data ?? []) as ExpenseRow[];
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

  // Analysis expenses: cash-flow set + category / type filters.
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
