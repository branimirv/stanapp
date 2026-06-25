import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { resolveCurrency } from '@/utils/currency';
import type { DashboardStats, RecentActivityItem } from '@/types/app.types';

export function useDashboardStats() {
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
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const monthStart = format(new Date(year, month - 1, 1), 'yyyy-MM-dd');
    const monthEnd = format(new Date(year, month, 0), 'yyyy-MM-dd');
    const today = format(now, 'yyyy-MM-dd');

    const [
      profileResult,
      rentResult,
      expensesResult,
      propertiesResult,
      tenantsResult,
      overdueResult,
      recentExpensesResult,
      recentPaymentsResult,
    ] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase
        .from('rent_payments')
        .select('amount, currency')
        .eq('status', 'paid')
        .eq('period_month', month)
        .eq('period_year', year),
      supabase
        .from('expenses')
        .select('amount, currency')
        .gte('billing_date', monthStart)
        .lte('billing_date', monthEnd),
      supabase.from('properties').select('id').eq('is_archived', false),
      supabase
        .from('tenants')
        .select('id, properties!inner(usage_status, is_archived)')
        .eq('is_active', true)
        .eq('properties.usage_status', 'rented')
        .eq('properties.is_archived', false),
      supabase
        .from('expenses')
        .select('id', { count: 'exact', head: true })
        .is('paid_at', null)
        .not('due_date', 'is', null)
        .lt('due_date', today),
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
      propertiesResult.error ??
      tenantsResult.error ??
      overdueResult.error ??
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
      netIncome: totalRentIncome - totalExpenses,
      activePropertiesCount: propertiesResult.data?.length ?? 0,
      activeTenantsCount: tenantsResult.data?.length ?? 0,
      overdueExpensesCount: overdueResult.count ?? 0,
      recentActivity,
      currency: defaultCurrency,
      month,
      year,
    });

    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { stats, isLoading, error, refetch };
}
