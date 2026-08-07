import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import {
  createCustomCategory as createCustomCategoryService,
  fetchExpenseCategories,
} from '@/services/expenseCategories';
import { useAuthStore } from '@/stores/authStore';
import { queryErrorMessage } from '@/utils/errors';

export function useExpenseCategories(options: { enabled?: boolean } = {}) {
  const { enabled = true } = options;
  const { user, isLoading: authLoading } = useAuthStore();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.expenseCategories.list(),
    queryFn: fetchExpenseCategories,
    enabled: !authLoading && enabled,
  });

  const createMutation = useMutation({
    mutationFn: (name: string) => {
      if (!user) throw new Error('User not authenticated');
      return createCustomCategoryService(user.id, name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.expenseCategories.all });
    },
  });

  const createCustomCategory = useCallback(
    (name: string) => createMutation.mutateAsync(name),
    [createMutation],
  );

  return {
    categories: query.data ?? [],
    isLoading: query.isLoading,
    error: queryErrorMessage(query.error),
    refetch: query.refetch,
    createCustomCategory,
  };
}
