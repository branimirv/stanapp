import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import type {
  Expense,
  ExpenseInsert,
  ExpenseStatusFilter,
  ExpenseUpdate,
} from '@/types/app.types';

interface UseExpensesOptions {
  propertyId?: string;
  status?: ExpenseStatusFilter;
}

export function useExpenses(options: UseExpensesOptions = {}) {
  const { propertyId, status } = options;
  const { user } = useAuthStore();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!user) {
      setExpenses([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    let query = supabase.from('expenses').select('*').order('billing_date', { ascending: false });

    if (propertyId) {
      query = query.eq('property_id', propertyId);
    }

    if (status === 'paid') {
      query = query.not('paid_at', 'is', null);
    } else if (status === 'unpaid') {
      query = query.is('paid_at', null);
    } else if (status === 'overdue') {
      query = query.is('paid_at', null).lt('due_date', format(new Date(), 'yyyy-MM-dd'));
    }

    const { data, error: err } = await query;

    if (err) {
      setError(err.message);
    } else {
      setExpenses(data ?? []);
    }

    setIsLoading(false);
  }, [user, propertyId, status]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const create = useCallback(async (values: ExpenseInsert) => {
    const { data, error: err } = await supabase
      .from('expenses')
      .insert(values)
      .select()
      .single();

    if (err) throw err;

    setExpenses((prev) => [data, ...prev]);
    return data;
  }, []);

  const update = useCallback(async (id: string, values: ExpenseUpdate) => {
    const { data, error: err } = await supabase
      .from('expenses')
      .update(values)
      .eq('id', id)
      .select()
      .single();

    if (err) throw err;

    setExpenses((prev) => prev.map((e) => (e.id === id ? data : e)));
    return data;
  }, []);

  const remove = useCallback(async (id: string) => {
    const { error: err } = await supabase.from('expenses').delete().eq('id', id);

    if (err) throw err;

    setExpenses((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const markAsPaid = useCallback(
    async (id: string) => update(id, { paid_at: new Date().toISOString() }),
    [update],
  );

  return { expenses, isLoading, error, refetch, create, update, remove, markAsPaid };
}
