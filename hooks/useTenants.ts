import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import {
  createTenant,
  deleteTenant,
  fetchTenant,
  fetchTenants,
  updateTenant,
} from '@/services/tenants';
import { useAuthStore } from '@/stores/authStore';
import type { Tenant, TenantInsert, TenantUpdate } from '@/types/app.types';
import { queryErrorMessage } from '@/utils/errors';

function useInvalidateTenants() {
  const queryClient = useQueryClient();
  return useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.tenants.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
  }, [queryClient]);
}

/** Create/update/delete tenants without subscribing to a list query. */
export function useTenantMutations() {
  const invalidate = useInvalidateTenants();

  const createMutation = useMutation({
    mutationFn: (values: TenantInsert) => createTenant(values),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: TenantUpdate }) => updateTenant(id, values),
    onSuccess: invalidate,
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => deleteTenant(id),
    onSuccess: invalidate,
  });

  const create = useCallback((values: TenantInsert) => createMutation.mutateAsync(values), [createMutation]);

  const update = useCallback(
    (id: string, values: TenantUpdate) => updateMutation.mutateAsync({ id, values }),
    [updateMutation],
  );

  const remove = useCallback((id: string) => removeMutation.mutateAsync(id), [removeMutation]);

  return { create, update, remove };
}

export function useTenants(options: { propertyId?: string; enabled?: boolean } = {}) {
  const { propertyId, enabled = true } = options;
  const { user } = useAuthStore();
  const mutations = useTenantMutations();

  const query = useQuery({
    queryKey: queryKeys.tenants.list(propertyId),
    queryFn: () => fetchTenants(propertyId),
    enabled: Boolean(user) && enabled,
  });

  return {
    tenants: query.data ?? [],
    isLoading: query.isLoading,
    error: queryErrorMessage(query.error),
    refetch: query.refetch,
    ...mutations,
  };
}

export function useTenant(id: string | undefined) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: id ? queryKeys.tenants.detail(id) : queryKeys.tenants.detail('none'),
    queryFn: () => fetchTenant(id as string),
    enabled: Boolean(user && id),
    initialData: () => {
      if (!id) return undefined;
      const lists = queryClient.getQueriesData<Tenant[]>({
        queryKey: [...queryKeys.tenants.all, 'list'],
      });
      for (const [, data] of lists) {
        if (!Array.isArray(data)) continue;
        const found = data.find((tenant) => tenant.id === id);
        if (found) return found;
      }
      return undefined;
    },
  });

  return {
    tenant: query.data ?? null,
    isLoading: query.isLoading,
    error: queryErrorMessage(query.error),
    refetch: query.refetch,
  };
}
