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

export function invalidateMemberDomain(qc: QueryClient, propertyId?: string) {
  if (propertyId) {
    void qc.invalidateQueries({ queryKey: queryKeys.members.list(propertyId) });
    void qc.invalidateQueries({ queryKey: queryKeys.members.forProperty(propertyId) });
    void qc.invalidateQueries({ queryKey: queryKeys.members.mine() });
    return;
  }
  void qc.invalidateQueries({ queryKey: queryKeys.members.all });
}

export function invalidateInviteDomain(qc: QueryClient, propertyIds?: string[]) {
  void qc.invalidateQueries({ queryKey: queryKeys.invites.all });
  if (!propertyIds?.length) return;
  for (const id of propertyIds) {
    void qc.invalidateQueries({ queryKey: queryKeys.invites.list(id) });
  }
}

export function invalidateCategoryDomain(qc: QueryClient) {
  void qc.invalidateQueries({ queryKey: queryKeys.expenseCategories.all });
}

/** After accepting pending invites — membership + portfolio surfaces. */
export function invalidateAcceptInvitesDomain(qc: QueryClient) {
  void qc.invalidateQueries({ queryKey: queryKeys.properties.all });
  void qc.invalidateQueries({ queryKey: queryKeys.members.all });
  void qc.invalidateQueries({ queryKey: queryKeys.invites.all });
  void qc.invalidateQueries({ queryKey: queryKeys.dashboard.all });
}
