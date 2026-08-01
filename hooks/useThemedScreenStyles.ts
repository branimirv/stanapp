import { useMemo } from 'react';

import { Spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';

export function useThemedScreenStyles() {
  const { theme } = useAppTheme();

  return useMemo(
    () => ({
      container: {
        flex: 1,
        backgroundColor: theme.colors.background,
      },
      scrollContent: {
        backgroundColor: theme.colors.background,
        padding: Spacing.md,
      },
    }),
    [theme.colors.background],
  );
}
