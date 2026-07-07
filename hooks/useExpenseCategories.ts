import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import type { ExpenseCategory } from '@/types/app.types';

export function useExpenseCategories() {
  const generateCustomCategoryKey = () =>
    `custom_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

  const { user, isLoading: authLoading } = useAuthStore();
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (authLoading) return;

    setIsLoading(true);
    setError(null);

    const { data, error: err } = await supabase
      .from('expense_categories')
      .select('*')
      .order('key', { ascending: true });

    if (err) {
      setError(err.message);
      setCategories([]);
    } else {
      setCategories(data ?? []);
    }

    setIsLoading(false);
  }, [authLoading]);

  const createCustomCategory = useCallback(
    async (name: string) => {
      if (!user) throw new Error('User not authenticated');

      const normalizedName = name.trim();
      if (!normalizedName) throw new Error('Category name is required');

      const categoryKey = generateCustomCategoryKey();
      const { data, error: err } = await supabase
        .from('expense_categories')
        .insert({
          user_id: user.id,
          key: categoryKey,
          name: normalizedName,
          icon: 'Tag',
          color: '#6B7280',
          type: 'irregular',
        })
        .select('*')
        .single();

      if (err) throw err;

      setCategories((prev) =>
        [...prev, data].sort((a, b) => {
          const left = (a.name ?? a.key).toLowerCase();
          const right = (b.name ?? b.key).toLowerCase();
          return left.localeCompare(right);
        }),
      );

      return data;
    },
    [user],
  );

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { categories, isLoading, error, refetch, createCustomCategory };
}
