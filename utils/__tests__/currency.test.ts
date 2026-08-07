import { resolveCurrency } from '@/utils/currency';
import type { Profile, Property } from '@/types/app.types';

function profile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: 'user-1',
    full_name: 'Test User',
    default_currency: 'EUR',
    language: 'hr',
    theme: 'system',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    ...overrides,
  } as Profile;
}

function property(overrides: Partial<Property> = {}): Property {
  return {
    id: 'prop-1',
    currency: 'USD',
    ...overrides,
  } as Property;
}

describe('resolveCurrency', () => {
  it('prefers row currency over property and profile', () => {
    expect(resolveCurrency(profile(), property(), 'GBP')).toBe('GBP');
  });

  it('falls back to property currency', () => {
    expect(resolveCurrency(profile(), property({ currency: 'USD' }), null)).toBe('USD');
  });

  it('falls back to profile default currency', () => {
    expect(resolveCurrency(profile({ default_currency: 'GBP' }), null, null)).toBe('GBP');
  });

  it('defaults to EUR when nothing is set', () => {
    expect(resolveCurrency(null, null, null)).toBe('EUR');
  });
});
