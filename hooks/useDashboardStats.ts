import { useState, useEffect, useCallback } from 'react';
import { addDays, format, subMonths } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { resolveCurrency } from '@/utils/currency';
import type { DashboardPeriod, DashboardStats, RecentActivityItem } from '@/types/app.types';

function calcDeltaPct(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return ((current - previous) / previous) * 100;
}

function getMonthRange(month: number, year: number) {
  const monthStart = format(new Date(year, month - 1, 1), 'yyyy-MM-dd');
  const monthEnd = format(new Date(year, month, 0), 'yyyy-MM-dd');
  return { monthStart, monthEnd };
}

export function useDashboardStats(period: DashboardPeriod) {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!user) {
      setStats(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const now = new Date();
    const today = format(now, 'yyyy-MM-dd');
    const upcomingEnd = format(addDays(now, 7), 'yyyy-MM-dd');
    const contractExpiryEnd = format(addDays(now, 30), 'yyyy-MM-dd');

    const { monthStart, monthEnd } = getMonthRange(period.month, period.year);

    const prevDate = subMonths(new Date(period.year, period.month - 1, 1), 1);
    const prevMonth = prevDate.getMonth() + 1;
    const prevYear = prevDate.getFullYear();
    const { monthStart: prevMonthStart, monthEnd: prevMonthEnd } = getMonthRange(prevMonth, prevYear);

    const rentQuery = supabase
      .from('rent_payments')
      .select('amount, currency, property_id, status')
      .eq('status', 'paid')
      .eq('period_month', period.month)
      .eq('period_year', period.year);

    const expensesQuery = supabase
      .from('expenses')
      .select('amount, currency')
      .gte('billing_date', monthStart)
      .lte('billing_date', monthEnd);

    const prevRentQuery = supabase
      .from('rent_payments')
      .select('amount, currency')
      .eq('status', 'paid')
      .eq('period_month', prevMonth)
      .eq('period_year', prevYear);

    const prevExpensesQuery = supabase
      .from('expenses')
      .select('amount, currency')
      .gte('billing_date', prevMonthStart)
      .lte('billing_date', prevMonthEnd);

    const [
      profileResult,
      rentResult,
      expensesResult,
      prevRentResult,
      prevExpensesResult,
      propertiesResult,
      tenantsResult,
      rentedPropertiesResult,
      monthPaymentsResult,
      overdueResult,
      upcomingResult,
      contractsExpiringResult,
      recentExpensesResult,
      recentPaymentsResult,
    ] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      rentQuery,
      expensesQuery,
      prevRentQuery,
      prevExpensesQuery,
      supabase.from('properties').select('id, usage_status').eq('is_archived', false),
      supabase
        .from('tenants')
        .select('id, property_id, properties!inner(usage_status, is_archived)')
        .eq('is_active', true)
        .eq('properties.usage_status', 'rented')
        .eq('properties.is_archived', false),
      supabase
        .from('properties')
        .select('id, rent_amount, currency')
        .eq('is_archived', false)
        .eq('usage_status', 'rented'),
      supabase
        .from('rent_payments')
        .select('property_id, status')
        .eq('period_month', period.month)
        .eq('period_year', period.year),
      supabase
        .from('expenses')
        .select('id', { count: 'exact', head: true })
        .is('paid_at', null)
        .not('due_date', 'is', null)
        .lt('due_date', today),
      supabase
        .from('expenses')
        .select('id', { count: 'exact', head: true })
        .is('paid_at', null)
        .not('due_date', 'is', null)
        .gte('due_date', today)
        .lte('due_date', upcomingEnd),
      supabase
        .from('tenants')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true)
        .not('contract_end', 'is', null)
        .gte('contract_end', today)
        .lte('contract_end', contractExpiryEnd),
      supabase
        .from('expenses')
        .select('id, amount, currency, notes, created_at, expense_categories(key)')
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('rent_payments')
        .select('id, amount, currency, notes, created_at, period_month, period_year')
        .order('created_at', { ascending: false })
        .limit(5),
    ]);

    const queryError =
      profileResult.error ??
      rentResult.error ??
      expensesResult.error ??
      prevRentResult.error ??
      prevExpensesResult.error ??
      propertiesResult.error ??
      tenantsResult.error ??
      rentedPropertiesResult.error ??
      monthPaymentsResult.error ??
      overdueResult.error ??
      upcomingResult.error ??
      contractsExpiringResult.error ??
      recentExpensesResult.error ??
      recentPaymentsResult.error;

    if (queryError) {
      setError(queryError.message);
      setIsLoading(false);
      return;
    }

    const profile = profileResult.data;
    const defaultCurrency = profile?.default_currency ?? 'EUR';

    const totalRentIncome = (rentResult.data ?? []).reduce((sum, row) => sum + Number(row.amount), 0);
    const totalExpenses = (expensesResult.data ?? []).reduce((sum, row) => sum + Number(row.amount), 0);
    const prevRentIncome = (prevRentResult.data ?? []).reduce((sum, row) => sum + Number(row.amount), 0);
    const prevExpenses = (prevExpensesResult.data ?? []).reduce((sum, row) => sum + Number(row.amount), 0);
    const prevNetIncome = prevRentIncome - prevExpenses;
    const netIncome = totalRentIncome - totalExpenses;

    const properties = propertiesResult.data ?? [];
    const rentedCount = properties.filter((p) => p.usage_status === 'rented').length;
    const vacantCount = properties.filter((p) => p.usage_status === 'vacant').length;
    const totalPropertiesCount = properties.length;

    const activeTenantPropertyIds = new Set(
      (tenantsResult.data ?? []).map((t) => t.property_id),
    );

    const expectedRent = (rentedPropertiesResult.data ?? [])
      .filter((p) => activeTenantPropertyIds.has(p.id))
      .reduce((sum, p) => sum + Number(p.rent_amount), 0);

    const paidPropertyIds = new Set(
      (monthPaymentsResult.data ?? [])
        .filter((p) => p.status === 'paid')
        .map((p) => p.property_id),
    );

    const unpaidRentCount = (rentedPropertiesResult.data ?? []).filter(
      (p) => activeTenantPropertyIds.has(p.id) && !paidPropertyIds.has(p.id),
    ).length;

    const recentExpenses: RecentActivityItem[] = (recentExpensesResult.data ?? []).map((row) => {
      const category = row.expense_categories as { key: string } | { key: string }[] | null;
      const categoryKey = Array.isArray(category) ? category[0]?.key : category?.key;
      return {
        type: 'expense' as const,
        id: row.id,
        title: categoryKey ?? row.notes ?? 'Expense',
        amount: Number(row.amount),
        currency: resolveCurrency(profile, null, row.currency),
        created_at: row.created_at,
      };
    });

    const recentPayments: RecentActivityItem[] = (recentPaymentsResult.data ?? []).map((row) => ({
      type: 'rent_payment' as const,
      id: row.id,
      title: `${String(row.period_month).padStart(2, '0')}/${row.period_year}`,
      amount: Number(row.amount),
      currency: resolveCurrency(profile, null, row.currency),
      created_at: row.created_at,
    }));

    const recentActivity = [...recentExpenses, ...recentPayments]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);

    setStats({
      totalRentIncome,
      totalExpenses,
      netIncome,
      incomeDeltaPct: calcDeltaPct(totalRentIncome, prevRentIncome),
      expensesDeltaPct: calcDeltaPct(totalExpenses, prevExpenses),
      netDeltaPct: calcDeltaPct(netIncome, prevNetIncome),
      activePropertiesCount: totalPropertiesCount,
      activeTenantsCount: tenantsResult.data?.length ?? 0,
      rentedCount,
      vacantCount,
      totalPropertiesCount,
      expectedRent,
      collectedRent: totalRentIncome,
      unpaidRentCount,
      overdueExpensesCount: overdueResult.count ?? 0,
      upcomingDueCount: upcomingResult.count ?? 0,
      contractsExpiringCount: contractsExpiringResult.count ?? 0,
      recentActivity,
      currency: defaultCurrency,
      month: period.month,
      year: period.year,
    });

    setIsLoading(false);
  }, [user, period]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { stats, isLoading, error, refetch };
}
