import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { fetchDashboardStats } from '@/services/dashboard';
import { useAuthStore } from '@/stores/authStore';
import type { DashboardPeriod } from '@/types/app.types';

export function useDashboardStats(period: DashboardPeriod) {
  const { user } = useAuthStore();

  const query = useQuery({
    queryKey: queryKeys.dashboard.stats(period),
    queryFn: () => fetchDashboardStats(user!.id, period),
    enabled: Boolean(user),
  });

  return {
    stats: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error ? (query.error as Error).message : null,
    refetch: query.refetch,
  };
}
