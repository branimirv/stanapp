import type { ReactNode } from 'react';
import { Stack } from 'expo-router';

import { useAppHeaderOptions } from '@/hooks/useAppHeaderOptions';
import { useAppTheme } from '@/hooks/useAppTheme';

/**
 * Shared stack layout for entity CRUD sections (property, tenant, expense, rent).
 * Owns the themed screen options and re-mount-on-theme-change key so individual
 * layouts only declare their screens.
 */
export function EntityStack({ children }: { children: ReactNode }) {
  const { isDark } = useAppTheme();
  const screenOptions = useAppHeaderOptions({ variant: 'stack' });

  return (
    <Stack key={isDark ? 'dark' : 'light'} screenOptions={screenOptions}>
      {children}
    </Stack>
  );
}
