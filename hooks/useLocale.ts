import { useTranslation } from 'react-i18next';
import { useProfile } from '@/hooks/useProfile';
import type { Language } from '@/types/app.types';

/**
 * Single source for the user's active language and default currency,
 * derived from the shared profile query with sensible fallbacks.
 */
export function useLocale() {
  const { i18n } = useTranslation();
  const { profile } = useProfile();

  const language = (profile?.language ?? (i18n.language as Language) ?? 'hr') as Language;
  const defaultCurrency = profile?.default_currency ?? 'EUR';

  return { language, defaultCurrency, profile };
}
