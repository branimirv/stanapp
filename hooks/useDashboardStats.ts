import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { fetchDashboardStats } from '@/services/dashboard';
import { useAuthStore } from '@/stores/authStore';
import type { DashboardPeriod } from '@/types/app.types';
import { queryErrorMessage } from '@/utils/errors';

export function useDashboardStats(period: DashboardPeriod) {
  const { user } = useAuthStore();

  const query = useQuery({
    queryKey: queryKeys.dashboard.stats(period),
    queryFn: () => fetchDashboardStats(user!.id, period),
    enabled: Boolean(user),
    // Keep the previous month on screen while the next period loads — avoids
    // swapping the whole dashboard for skeletons on every arrow tap.
    placeholderData: keepPreviousData,
  });

  return {
    stats: query.data ?? null,
    isLoading: query.isLoading,
    isPeriodRefreshing: query.isFetching && query.isPlaceholderData,
    error: queryErrorMessage(query.error),
    refetch: query.refetch,
  };
}
