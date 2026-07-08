import { useCallback, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import {
  createProperty,
  deleteProperty,
  fetchProperties,
  fetchProperty,
  updateProperty,
} from '@/services/properties';
import { useAuthStore } from '@/stores/authStore';
import type { Property, PropertyInsert, PropertyUpdate } from '@/types/app.types';

function useInvalidateProperties() {
  const queryClient = useQueryClient();
  return useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.properties.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });
  }, [queryClient]);
}

export function useProperties() {
  const { user } = useAuthStore();
  const invalidate = useInvalidateProperties();

  const query = useQuery({
    queryKey: queryKeys.properties.lists(),
    queryFn: fetchProperties,
    enabled: Boolean(user),
  });

  const createMutation = useMutation({
    mutationFn: (values: PropertyInsert) =>
      createProperty({ ...values, user_id: values.user_id ?? user?.id }),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: PropertyUpdate }) =>
      updateProperty(id, values),
    onSuccess: invalidate,
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => deleteProperty(id),
    onSuccess: invalidate,
  });

  const create = useCallback(
    (values: PropertyInsert) => {
      if (!user) throw new Error('Not authenticated');
      return createMutation.mutateAsync(values);
    },
    [createMutation, user],
  );

  const update = useCallback(
    (id: string, values: PropertyUpdate) => updateMutation.mutateAsync({ id, values }),
    [updateMutation],
  );

  const remove = useCallback((id: string) => removeMutation.mutateAsync(id), [removeMutation]);

  return {
    properties: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error ? (query.error as Error).message : null,
    refetch: query.refetch,
    create,
    update,
    remove,
  };
}

/**
 * Single property by id. Seeds from the list cache when present so detail
 * screens read the same canonical record the list populated.
 */
export function useProperty(id: string | undefined) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: id ? queryKeys.properties.detail(id) : queryKeys.properties.detail('none'),
    queryFn: () => fetchProperty(id as string),
    enabled: Boolean(user && id),
    initialData: () => {
      if (!id) return undefined;
      const list = queryClient.getQueryData<Property[]>(queryKeys.properties.lists());
      return list?.find((p) => p.id === id);
    },
  });

  return {
    property: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error ? (query.error as Error).message : null,
    refetch: query.refetch,
  };
}

/** Active child properties for a given parent, derived from the list cache. */
export function useChildProperties(parentId: string | undefined) {
  const { properties } = useProperties();
  return useMemo(
    () =>
      parentId
        ? properties.filter((p) => p.parent_property_id === parentId && !p.is_archived)
        : [],
    [properties, parentId],
  );
}
