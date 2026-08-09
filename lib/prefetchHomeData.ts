import { queryClient } from '@/lib/queryClient';
import { queryKeys } from '@/lib/queryKeys';
import { fetchDashboardStats } from '@/services/dashboard';
import { fetchProfile } from '@/services/profile';
import { fetchProperties } from '@/services/properties';
import { getCurrentMonthRange } from '@/utils/dateRange';

/**
 * Prefetch the queries the home tab needs before we reveal the signed-in shell.
 * Failures are left to the screen — callers should still dismiss the overlay.
 */
export async function prefetchHomeData(userId: string): Promise<void> {
  const { month, year } = getCurrentMonthRange();

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: queryKeys.dashboard.stats({ month, year }),
      queryFn: () => fetchDashboardStats(userId, { month, year }),
    }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.properties.lists(),
      queryFn: fetchProperties,
    }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.profile(userId),
      queryFn: () => fetchProfile(userId),
    }),
  ]);
}
