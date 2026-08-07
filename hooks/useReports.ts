import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { buildDefaultReportPeriod, fetchReportData } from '@/services/reports';
import { useAuthStore } from '@/stores/authStore';
import type {
  ReportCategoryTypeFilter,
  ReportPeriod,
} from '@/types/app.types';
import { queryErrorMessage } from '@/utils/errors';

export { buildReportPeriod } from '@/services/reports';

interface UseReportsOptions {
  period?: ReportPeriod;
  propertyId?: string;
  categoryId?: string;
  categoryType?: ReportCategoryTypeFilter;
}

export function useReports(options: UseReportsOptions = {}) {
  const { user } = useAuthStore();
  const period = useMemo(() => options.period ?? buildDefaultReportPeriod(), [options.period]);
  const { propertyId, categoryId, categoryType } = options;

  const query = useQuery({
    queryKey: queryKeys.reports.data({
      period,
      propertyId,
      categoryId,
      categoryType,
    }),
    queryFn: () =>
      fetchReportData({
        userId: user!.id,
        period,
        propertyId,
        categoryId,
        categoryType,
      }),
    enabled: Boolean(user),
  });

  return {
    report: query.data ?? null,
    isLoading: query.isLoading,
    error: queryErrorMessage(query.error),
    refetch: query.refetch,
  };
}
