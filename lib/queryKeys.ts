import type {
  DashboardPeriod,
  ExpenseStatusFilter,
  ReportPeriod,
} from '@/types/app.types';

export interface ExpenseListFilters {
  propertyId?: string;
  status?: ExpenseStatusFilter;
}

export interface RentPaymentListFilters {
  propertyId?: string;
  tenantId?: string;
}

export interface ReportFilters {
  period?: ReportPeriod;
  propertyId?: string;
  categoryId?: string;
  categoryType?: string;
}

export const queryKeys = {
  profile: (userId: string) => ['profile', userId] as const,

  properties: {
    all: ['properties'] as const,
    lists: () => [...queryKeys.properties.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.properties.all, 'detail', id] as const,
    statusHistory: (id: string) => [...queryKeys.properties.all, 'statusHistory', id] as const,
  },

  tenants: {
    all: ['tenants'] as const,
    list: (propertyId?: string) =>
      [...queryKeys.tenants.all, 'list', propertyId ?? 'all'] as const,
    detail: (id: string) => [...queryKeys.tenants.all, 'detail', id] as const,
  },

  expenses: {
    all: ['expenses'] as const,
    list: (filters: ExpenseListFilters = {}) =>
      [...queryKeys.expenses.all, 'list', filters.propertyId ?? 'all', filters.status ?? 'all'] as const,
    detail: (id: string) => [...queryKeys.expenses.all, 'detail', id] as const,
  },

  rentPayments: {
    all: ['rentPayments'] as const,
    list: (filters: RentPaymentListFilters = {}) =>
      [...queryKeys.rentPayments.all, 'list', filters.propertyId ?? 'all', filters.tenantId ?? 'all'] as const,
    detail: (id: string) => [...queryKeys.rentPayments.all, 'detail', id] as const,
  },

  expenseCategories: {
    all: ['expenseCategories'] as const,
    list: () => [...queryKeys.expenseCategories.all, 'list'] as const,
  },

  dashboard: {
    all: ['dashboard'] as const,
    stats: (period: DashboardPeriod) =>
      [...queryKeys.dashboard.all, 'stats', period.month, period.year] as const,
  },

  reports: {
    all: ['reports'] as const,
    data: (filters: ReportFilters) =>
      [
        ...queryKeys.reports.all,
        'data',
        filters.period?.startDate ?? 'all',
        filters.period?.endDate ?? 'all',
        filters.propertyId ?? 'all',
        filters.categoryId ?? 'all',
        filters.categoryType ?? 'all',
      ] as const,
  },

  members: {
    all: ['members'] as const,
    mine: () => [...queryKeys.members.all, 'mine'] as const,
    list: (propertyId: string) => [...queryKeys.members.all, 'list', propertyId] as const,
    forProperty: (propertyId: string) =>
      [...queryKeys.members.all, 'forProperty', propertyId] as const,
  },

  invites: {
    all: ['invites'] as const,
    list: (propertyId: string) => [...queryKeys.invites.all, 'list', propertyId] as const,
    ownedPending: () => [...queryKeys.invites.all, 'ownedPending'] as const,
  },
} as const;
