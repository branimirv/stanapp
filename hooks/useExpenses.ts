import { useCallback } from 'react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { invalidateExpenseDomain } from '@/lib/queryInvalidation';
import { queryKeys, type ExpenseListFilters } from '@/lib/queryKeys';
import {
  createExpense,
  deleteExpense,
  fetchExpense,
  fetchExpenses,
  updateExpense,
} from '@/services/expenses';
import { useAuthStore } from '@/stores/authStore';
import type { Expense, ExpenseInsert, ExpenseUpdate } from '@/types/app.types';
import { queryErrorMessage } from '@/utils/errors';

function useInvalidateExpenses() {
  const queryClient = useQueryClient();
  return useCallback(() => {
    invalidateExpenseDomain(queryClient);
  }, [queryClient]);
}

/** Create/update/delete expenses without subscribing to a list query. */
export function useExpenseMutations() {
  const invalidate = useInvalidateExpenses();

  const createMutation = useMutation({
    mutationFn: (values: ExpenseInsert) => createExpense(values),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: ExpenseUpdate }) => updateExpense(id, values),
    onSuccess: invalidate,
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => deleteExpense(id),
    onSuccess: invalidate,
  });

  const create = useCallback((values: ExpenseInsert) => createMutation.mutateAsync(values), [createMutation]);

  const update = useCallback(
    (id: string, values: ExpenseUpdate) => updateMutation.mutateAsync({ id, values }),
    [updateMutation],
  );

  const remove = useCallback((id: string) => removeMutation.mutateAsync(id), [removeMutation]);

  const markAsPaid = useCallback(
    (id: string) => update(id, { paid_at: new Date().toISOString() }),
    [update],
  );

  return { create, update, remove, markAsPaid };
}

export function useExpenses(
  filters: ExpenseListFilters = {},
  options: { enabled?: boolean } = {},
) {
  const { enabled = true } = options;
  const { user } = useAuthStore();
  const mutations = useExpenseMutations();

  const query = useQuery({
    queryKey: queryKeys.expenses.list(filters),
    queryFn: () => fetchExpenses(filters),
    enabled: Boolean(user) && enabled,
    // Keep the previous property/status list on screen while the next filter
    // loads — avoids swapping Troškovi for skeletons on every pill tap.
    placeholderData: keepPreviousData,
  });

  return {
    expenses: query.data ?? [],
    isLoading: query.isLoading,
    isFilterRefreshing: query.isFetching && query.isPlaceholderData,
    error: queryErrorMessage(query.error),
    refetch: query.refetch,
    ...mutations,
  };
}

export function useExpense(id: string | undefined) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: id ? queryKeys.expenses.detail(id) : queryKeys.expenses.detail('none'),
    queryFn: () => fetchExpense(id as string),
    enabled: Boolean(user && id),
    initialData: () => {
      if (!id) return undefined;
      // Only list caches are Expense[]; detail caches are a single Expense.
      const lists = queryClient.getQueriesData<Expense[]>({
        queryKey: [...queryKeys.expenses.all, 'list'],
      });
      for (const [, data] of lists) {
        if (!Array.isArray(data)) continue;
        const found = data.find((e) => e.id === id);
        if (found) return found;
      }
      return undefined;
    },
  });

  return {
    expense: query.data ?? null,
    isLoading: query.isLoading,
    error: queryErrorMessage(query.error),
    refetch: query.refetch,
  };
}
