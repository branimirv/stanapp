import type { Tenant } from '@/types/app.types';
import { getContractStatus } from '@/utils/tenant';

function tenant(overrides: Partial<Tenant> = {}): Tenant {
  return {
    id: 't-1',
    property_id: 'p-1',
    first_name: 'Ana',
    last_name: 'Horvat',
    email: null,
    phone: null,
    contract_start: '2024-01-01',
    contract_end: '2026-12-31',
    deposit_amount: 0,
    is_active: true,
    notes: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    ...overrides,
  };
}

describe('getContractStatus', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-06-15T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns active when end date is more than CONTRACT_EXPIRING_DAYS away', () => {
    expect(getContractStatus(tenant({ contract_end: '2025-12-31' }))).toBe('active');
  });

  it('returns expiring_soon when end date is within CONTRACT_EXPIRING_DAYS', () => {
    expect(getContractStatus(tenant({ contract_end: '2025-07-01' }))).toBe('expiring_soon');
  });

  it('returns expired when end date is in the past', () => {
    expect(getContractStatus(tenant({ contract_end: '2025-06-01' }))).toBe('expired');
  });

  it('returns expired when tenant is inactive', () => {
    expect(
      getContractStatus(tenant({ is_active: false, contract_end: '2025-12-31' })),
    ).toBe('expired');
  });

  it('returns active when there is no end date', () => {
    expect(getContractStatus(tenant({ contract_end: null }))).toBe('active');
  });
});
