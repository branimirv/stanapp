import type { ReactNode } from 'react';
import { Stack } from 'expo-router';
import { useTheme } from 'react-native-paper';

import { useAppHeaderOptions } from '@/hooks/useAppHeaderOptions';

/**
 * Shared stack layout for entity CRUD sections (property, tenant, expense, rent).
 * Owns the themed screen options and re-mount-on-theme-change key so individual
 * layouts only declare their screens.
 */
export function EntityStack({ children }: { children: ReactNode }) {
  const theme = useTheme();
  const screenOptions = useAppHeaderOptions({ variant: 'stack', showDefaultSettings: true });

  return (
    <Stack key={theme.dark ? 'dark' : 'light'} screenOptions={screenOptions}>
      {children}
    </Stack>
  );
}
