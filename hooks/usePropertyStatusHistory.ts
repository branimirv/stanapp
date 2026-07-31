import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { fetchPropertyStatusHistory } from '@/services/propertyStatusHistory';
import { useAuthStore } from '@/stores/authStore';

export function usePropertyStatusHistory(propertyId: string | undefined, enabled = true) {
  const { user } = useAuthStore();

  const query = useQuery({
    queryKey: queryKeys.properties.statusHistory(propertyId ?? 'none'),
    queryFn: () => fetchPropertyStatusHistory(propertyId as string),
    enabled: Boolean(user && propertyId && enabled),
  });

  return {
    history: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error ? (query.error as Error).message : null,
    refetch: query.refetch,
  };
}
