import { useMemo } from 'react';

import { Spacing } from '@/constants/theme';

export function useThemedScreenStyles() {
  return useMemo(
    () => ({
      // Keep fill transparent so root `ScreenAmbient` + liquid glass can refract.
      container: {
        flex: 1,
        backgroundColor: 'transparent',
      },
      scrollContent: {
        backgroundColor: 'transparent',
        padding: Spacing.md,
      },
    }),
    [],
  );
}
