import { useAppHeaderOptions } from '@/hooks/useAppHeaderOptions';

/** @deprecated Prefer `useAppHeaderOptions` — kept for gradual migration. */
export function useThemedStackScreenOptions() {
  return useAppHeaderOptions({ variant: 'stack' });
}
