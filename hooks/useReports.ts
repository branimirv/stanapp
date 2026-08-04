import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { buildDefaultReportPeriod, fetchReportData } from '@/services/reports';
import { useAuthStore } from '@/stores/authStore';
import type {
  ReportCategoryTypeFilter,
  ReportExpensePaymentStatus,
  ReportPeriod,
} from '@/types/app.types';

export { buildReportPeriod } from '@/services/reports';

interface UseReportsOptions {
  period?: ReportPeriod;
  propertyId?: string;
  categoryId?: string;
  categoryType?: ReportCategoryTypeFilter;
  expensePaymentStatus?: ReportExpensePaymentStatus;
}

export function useReports(options: UseReportsOptions = {}) {
  const { user } = useAuthStore();
  const period = useMemo(() => options.period ?? buildDefaultReportPeriod(), [options.period]);
  const { propertyId, categoryId, categoryType, expensePaymentStatus } = options;

  const query = useQuery({
    queryKey: queryKeys.reports.data({
      period,
      propertyId,
      categoryId,
      categoryType,
      expensePaymentStatus,
    }),
    queryFn: () =>
      fetchReportData({
        userId: user!.id,
        period,
        propertyId,
        categoryId,
        categoryType,
        expensePaymentStatus,
      }),
    enabled: Boolean(user),
  });

  return {
    report: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error ? (query.error as Error).message : null,
    refetch: query.refetch,
  };
}
