import {
  eachMonthOfInterval,
  endOfMonth,
  format,
  startOfMonth,
  subMonths,
} from 'date-fns';
import { supabase } from '@/lib/supabase';
import { resolveCurrency } from '@/utils/currency';
import { getCategoryEffectiveType } from '@/utils/expense';
import type {
  CategoryBreakdown,
  ExpenseCategory,
  MonthlyIncomeExpense,
  Property,
  PropertyReportSummary,
  ReportCategoryTypeFilter,
  ReportData,
  ReportPeriod,
  ReportPeriodPreset,
} from '@/types/app.types';

const ALL_TIME_START = '1970-01-01';

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

  const startDate = period.startDate;
  const endDate = period.endDate;
  let start = new Date(startDate);
  const end = new Date(endDate);

  const [profileResult, propertiesResult, categoriesResult, rentResult, expensesResult] =
    await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase.from('properties').select('*').eq('is_archived', false),
      supabase.from('expense_categories').select('*'),
      supabase
        .from('rent_payments')
        .select('*')
        .eq('status', 'paid')
        .gte('period_year', start.getFullYear())
        .lte('period_year', end.getFullYear()),
      supabase
        .from('expenses')
        .select('*')
        .gte('billing_date', startDate)
        .lte('billing_date', endDate),
    ]);

  const queryError =
    profileResult.error ??
    propertiesResult.error ??
    categoriesResult.error ??
    rentResult.error ??
    expensesResult.error;

  if (queryError) throw queryError;

  const profile = profileResult.data;
  const categories = categoriesResult.data ?? [];
  const categoryMap = new Map<string, ExpenseCategory>(
    categories.map((category) => [category.id, category]),
  );

  const defaultCurrency = profile?.default_currency ?? 'EUR';

  let properties = propertiesResult.data ?? [];
  if (propertyId) {
    properties = properties.filter((property) => property.id === propertyId);
  }

  let rentInPeriod = (rentResult.data ?? []).filter((payment) => {
    const paymentDate = new Date(payment.period_year, payment.period_month - 1, 1);
    return paymentDate >= startOfMonth(start) && paymentDate <= endOfMonth(end);
  });

  if (propertyId) {
    rentInPeriod = rentInPeriod.filter((payment) => payment.property_id === propertyId);
  }

  let expensesInPeriod = expensesResult.data ?? [];

  if (propertyId) {
    expensesInPeriod = expensesInPeriod.filter((expense) => expense.property_id === propertyId);
  }

  if (categoryId) {
    expensesInPeriod = expensesInPeriod.filter((expense) => expense.category_id === categoryId);
  }

  if (categoryType !== 'all') {
    expensesInPeriod = expensesInPeriod.filter((expense) => {
      const category = categoryMap.get(expense.category_id);
      return category ? getCategoryEffectiveType(category) === categoryType : false;
    });
  }

  const allCurrencyRows = [
    ...rentInPeriod.map((row) => ({ currency: row.currency })),
    ...expensesInPeriod.map((row) => ({ currency: row.currency })),
  ];
  const currenciesFound = collectCurrencies(allCurrencyRows, properties, defaultCurrency);
  const hasMixedCurrencies = currenciesFound.length > 1;

  if (period.preset === 'all_time') {
    const earliestTimestamps: number[] = [];
    for (const expense of expensesInPeriod) {
      earliestTimestamps.push(new Date(expense.billing_date).getTime());
    }
    for (const payment of rentInPeriod) {
      earliestTimestamps.push(new Date(payment.period_year, payment.period_month - 1, 1).getTime());
    }
    start = earliestTimestamps.length
      ? startOfMonth(new Date(Math.min(...earliestTimestamps)))
      : startOfMonth(end);
  }

  const effectiveStartDate = format(start, 'yyyy-MM-dd');
  const months = eachMonthOfInterval({ start, end });
  const monthlyIncomeExpense: MonthlyIncomeExpense[] = months.map((monthDate) => {
    const month = monthDate.getMonth() + 1;
    const year = monthDate.getFullYear();

    const income = rentInPeriod
      .filter((payment) => payment.period_month === month && payment.period_year === year)
      .reduce((sum, payment) => sum + Number(payment.amount), 0);

    const monthStart = format(startOfMonth(monthDate), 'yyyy-MM-dd');
    const monthEnd = format(endOfMonth(monthDate), 'yyyy-MM-dd');

    const expenses = expensesInPeriod
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
  for (const expense of expensesInPeriod) {
    const current = categoryTotals.get(expense.category_id) ?? 0;
    categoryTotals.set(expense.category_id, current + Number(expense.amount));
  }

  const totalExpenses = expensesInPeriod.reduce((sum, expense) => sum + Number(expense.amount), 0);
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
        percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
      };
    })
    .sort((a, b) => b.amount - a.amount);

  const propertySummaries: PropertyReportSummary[] = properties.map((property) => {
    const propertyCurrency = resolveCurrency(profile, property, property.currency);
    const totalRentCollected = rentInPeriod
      .filter((payment) => payment.property_id === property.id)
      .reduce((sum, payment) => sum + Number(payment.amount), 0);

    const totalExpensesPaid = expensesInPeriod
      .filter((expense) => expense.property_id === property.id && expense.paid_at !== null)
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

  const totalIncome = rentInPeriod.reduce((sum, payment) => sum + Number(payment.amount), 0);

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
    netIncome: totalIncome - totalExpenses,
  };
}
