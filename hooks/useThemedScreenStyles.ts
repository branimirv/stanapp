import { useMemo } from 'react';
import { useTheme } from 'react-native-paper';

import { Spacing } from '@/constants/theme';

export function useThemedScreenStyles() {
  const theme = useTheme();

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
