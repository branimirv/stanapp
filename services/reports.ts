import { format, startOfMonth } from 'date-fns';
import { supabase } from '@/lib/supabase';
import {
  aggregateReportData,
  type ExpenseRow,
  type RentRow,
} from '@/utils/reportAggregates';
import { buildPreviousReportPeriod } from '@/utils/reportPeriod';
import { throwQueryError } from '@/utils/errors';
import type {
  ExpenseCategory,
  Property,
  ReportCategoryTypeFilter,
  ReportData,
  ReportPeriod,
} from '@/types/app.types';

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
  propertyId,
  categoryId,
  categoryType = 'all',
}: FetchReportDataParams): Promise<ReportData> {
  const previousPeriod = buildPreviousReportPeriod(period);
  const endDate = period.endDate;
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

  return aggregateReportData({
    period,
    profile: profileResult.data,
    properties: (propertiesResult.data ?? []) as Property[],
    categories: (categoriesResult.data ?? []) as ExpenseCategory[],
    rentRows: (rentResult.data ?? []) as RentRow[],
    expenseRows: (expensesResult.data ?? []) as ExpenseRow[],
    propertyId,
    categoryId,
    categoryType,
  });
}
