import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { ExpenseCategory } from '@/types/app.types';

export function useExpenseCategories() {
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const { data, error: err } = await supabase
      .from('expense_categories')
      .select('*')
      .order('key', { ascending: true });

    if (err) {
      setError(err.message);
    } else {
      setCategories(data ?? []);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { categories, isLoading, error, refetch };
}
