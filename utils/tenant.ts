import { differenceInDays, parseISO } from 'date-fns';

import { CONTRACT_EXPIRING_DAYS } from '@/constants/config';
import type { Tenant } from '@/types/app.types';

export type ContractStatus = 'active' | 'expiring_soon' | 'expired';

export const CONTRACT_STATUS_LABELS = {
  active: 'tenants.active',
  expiring_soon: 'tenants.expiringSoon',
  expired: 'tenants.expired',
} as const;

/** Derive contract chip status from active flag and end date. */
export function getContractStatus(tenant: Tenant): ContractStatus {
  if (!tenant.is_active) return 'expired';
  if (!tenant.contract_end) return 'active';

  const daysLeft = differenceInDays(parseISO(tenant.contract_end), new Date());
  if (daysLeft < 0) return 'expired';
  if (daysLeft <= CONTRACT_EXPIRING_DAYS) return 'expiring_soon';
  return 'active';
}
