import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { invalidateRentDomain } from '@/lib/queryInvalidation';
import { queryKeys, type RentPaymentListFilters } from '@/lib/queryKeys';
import {
  createRentPayment,
  deleteRentPayment,
  fetchRentPayment,
  fetchRentPayments,
  updateRentPayment,
} from '@/services/rentPayments';
import { useAuthStore } from '@/stores/authStore';
import type { RentPayment, RentPaymentInsert, RentPaymentUpdate } from '@/types/app.types';
import { formatDateOnly } from '@/utils/formatters';
import { queryErrorMessage } from '@/utils/errors';

function useInvalidateRentPayments() {
  const queryClient = useQueryClient();
  return useCallback(() => {
    invalidateRentDomain(queryClient);
  }, [queryClient]);
}

/** Create/update/delete rent payments without subscribing to a list query. */
export function useRentPaymentMutations() {
  const invalidate = useInvalidateRentPayments();

  const createMutation = useMutation({
    mutationFn: (values: RentPaymentInsert) => createRentPayment(values),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: RentPaymentUpdate }) =>
      updateRentPayment(id, values),
    onSuccess: invalidate,
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => deleteRentPayment(id),
    onSuccess: invalidate,
  });

  const create = useCallback(
    (values: RentPaymentInsert) => createMutation.mutateAsync(values),
    [createMutation],
  );

  const update = useCallback(
    (id: string, values: RentPaymentUpdate) => updateMutation.mutateAsync({ id, values }),
    [updateMutation],
  );

  const remove = useCallback((id: string) => removeMutation.mutateAsync(id), [removeMutation]);

  const markAsPaid = useCallback(
    (id: string) => update(id, { status: 'paid', payment_date: formatDateOnly(new Date()) }),
    [update],
  );

  return { create, update, remove, markAsPaid };
}

export function useRentPayments(
  filters: RentPaymentListFilters = {},
  options: { enabled?: boolean } = {},
) {
  const { enabled = true } = options;
  const { user } = useAuthStore();
  const mutations = useRentPaymentMutations();

  const query = useQuery({
    queryKey: queryKeys.rentPayments.list(filters),
    queryFn: () => fetchRentPayments(filters),
    enabled: Boolean(user) && enabled,
  });

  return {
    rentPayments: query.data ?? [],
    isLoading: query.isLoading,
    error: queryErrorMessage(query.error),
    refetch: query.refetch,
    ...mutations,
  };
}

export function useRentPayment(id: string | undefined) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: id ? queryKeys.rentPayments.detail(id) : queryKeys.rentPayments.detail('none'),
    queryFn: () => fetchRentPayment(id as string),
    enabled: Boolean(user && id),
    initialData: () => {
      if (!id) return undefined;
      const lists = queryClient.getQueriesData<RentPayment[]>({
        queryKey: [...queryKeys.rentPayments.all, 'list'],
      });
      for (const [, data] of lists) {
        if (!Array.isArray(data)) continue;
        const found = data.find((payment) => payment.id === id);
        if (found) return found;
      }
      return undefined;
    },
  });

  return {
    rentPayment: query.data ?? null,
    isLoading: query.isLoading,
    error: queryErrorMessage(query.error),
    refetch: query.refetch,
  };
}
