import { queryClient } from '@/lib/queryClient';
import { queryKeys } from '@/lib/queryKeys';
import { fetchDashboardStats } from '@/services/dashboard';
import { fetchProfile } from '@/services/profile';
import { fetchProperties } from '@/services/properties';
import { getCurrentMonthRange } from '@/utils/dateRange';

/** Cap so a dead network can't hold the boot overlay forever. */
export const HOME_PREFETCH_MAX_MS = 6000;

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

/**
 * Same as {@link prefetchHomeData}, but always settles within `maxMs`
 * (success, failure, or timeout). Safe to await under the boot overlay.
 */
export async function prefetchHomeDataBounded(
  userId: string,
  maxMs = HOME_PREFETCH_MAX_MS,
): Promise<void> {
  await Promise.race([
    prefetchHomeData(userId).catch(() => {
      // Reveal anyway — home can show its own error/skeleton if needed.
    }),
    new Promise<void>((resolve) => setTimeout(resolve, maxMs)),
  ]);
}
