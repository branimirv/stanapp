import type { ReactNode } from 'react';
import { Stack } from 'expo-router';
import { StyleSheet } from 'react-native';

import { ErrorState } from '@/components/ui/ErrorState';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { Spacing } from '@/constants/theme';

interface DetailScreenScaffoldProps {
  title: string;
  isLoading: boolean;
  isReady: boolean;
  error: string | null;
  notFoundMessage: string;
  onRetry: () => void;
  headerRight?: () => ReactNode;
  loaderCount?: number;
  children: ReactNode;
}

export function DetailScreenScaffold({
  title,
  isLoading,
  isReady,
  error,
  notFoundMessage,
  onRetry,
  headerRight,
  loaderCount = 5,
  children,
}: DetailScreenScaffoldProps) {
  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ title }} />
        <SkeletonLoader count={loaderCount} style={styles.loader} />
      </>
    );
  }

  if (error || !isReady) {
    return (
      <>
        <Stack.Screen options={{ title }} />
        <ErrorState message={error ?? notFoundMessage} onRetry={onRetry} />
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title, headerRight }} />
      {children}
    </>
  );
}

const styles = StyleSheet.create({
  loader: {
    padding: Spacing.md,
  },
});
