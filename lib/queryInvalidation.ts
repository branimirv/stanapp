import type { QueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/queryKeys';

export function invalidatePropertyDomain(qc: QueryClient) {
  void qc.invalidateQueries({ queryKey: queryKeys.properties.all });
  void qc.invalidateQueries({ queryKey: queryKeys.dashboard.all });
  void qc.invalidateQueries({ queryKey: queryKeys.reports.all });
}

export function invalidateExpenseDomain(qc: QueryClient) {
  void qc.invalidateQueries({ queryKey: queryKeys.expenses.all });
  void qc.invalidateQueries({ queryKey: queryKeys.dashboard.all });
  void qc.invalidateQueries({ queryKey: queryKeys.reports.all });
}

export function invalidateTenantDomain(qc: QueryClient) {
  void qc.invalidateQueries({ queryKey: queryKeys.tenants.all });
  void qc.invalidateQueries({ queryKey: queryKeys.dashboard.all });
}

export function invalidateRentDomain(qc: QueryClient) {
  void qc.invalidateQueries({ queryKey: queryKeys.rentPayments.all });
  void qc.invalidateQueries({ queryKey: queryKeys.dashboard.all });
  void qc.invalidateQueries({ queryKey: queryKeys.reports.all });
}
