import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { fetchEarliestReportActivityDate } from '@/services/reports';
import { useAuthStore } from '@/stores/authStore';

export function useEarliestReportActivity(propertyId?: string) {
  const { user } = useAuthStore();
  const resolvedPropertyId =
    !propertyId || propertyId === 'all' ? 'all' : propertyId;

  const query = useQuery({
    queryKey: [...queryKeys.reports.all, 'earliestActivity', resolvedPropertyId] as const,
    queryFn: () =>
      fetchEarliestReportActivityDate(
        resolvedPropertyId === 'all' ? undefined : resolvedPropertyId,
      ),
    enabled: Boolean(user),
    staleTime: 60_000,
  });

  return {
    earliestActivityDate: query.data ?? null,
    isLoading: query.isLoading,
  };
}
