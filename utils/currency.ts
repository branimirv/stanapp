import type { Profile, Property } from '@/types/app.types';

export function resolveCurrency(
  profile: Profile | null,
  property?: Property | null,
  rowCurrency?: string | null,
): string {
  return rowCurrency ?? property?.currency ?? profile?.default_currency ?? 'EUR';
}
