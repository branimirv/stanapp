import { useTheme } from 'react-native-paper';

import { useAppHeaderOptions } from '@/hooks/useAppHeaderOptions';

interface ThemedStackScreenOptions {
  showSettings?: boolean;
}

/** @deprecated Prefer `useAppHeaderOptions` — kept for gradual migration. */
export function useThemedStackScreenOptions({
  showSettings = false,
}: ThemedStackScreenOptions = {}) {
  return useAppHeaderOptions({
    variant: 'stack',
    showDefaultSettings: showSettings,
  });
}
