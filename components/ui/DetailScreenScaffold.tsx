import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { ErrorState } from '@/components/ui/ErrorState';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { StackScreenChrome } from '@/components/ui/StackScreenChrome';
import { Spacing } from '@/constants/theme';

interface DetailScreenScaffoldProps {
  title: string;
  /**
   * When true, chrome stays title-less and the screen owns its page title
   * (e.g. property detail). Default shows the title in content.
   */
  hideHeaderTitle?: boolean;
  isLoading: boolean;
  isReady: boolean;
  error: string | null;
  notFoundMessage: string;
  onRetry: () => void;
  headerRight?: () => ReactNode;
  loaderCount?: number;
  /** Fill under floating header so overlays (e.g. liquid tabs) can blur content. */
  edgeToEdge?: boolean;
  children: ReactNode;
}

export function DetailScreenScaffold({
  title,
  hideHeaderTitle = false,
  isLoading,
  isReady,
  error,
  notFoundMessage,
  onRetry,
  headerRight,
  loaderCount = 5,
  edgeToEdge = false,
  children,
}: DetailScreenScaffoldProps) {
  if (isLoading) {
    return (
      <StackScreenChrome title={title} hideHeaderTitle={hideHeaderTitle} edgeToEdge={edgeToEdge}>
        <SkeletonLoader count={loaderCount} style={styles.loader} />
      </StackScreenChrome>
    );
  }

  if (error || !isReady) {
    return (
      <StackScreenChrome title={title} hideHeaderTitle={hideHeaderTitle} edgeToEdge={edgeToEdge}>
        <ErrorState message={error ?? notFoundMessage} onRetry={onRetry} />
      </StackScreenChrome>
    );
  }

  return (
    <StackScreenChrome
      title={title}
      hideHeaderTitle={hideHeaderTitle}
      right={headerRight?.()}
      edgeToEdge={edgeToEdge}
    >
      <View className="flex-1">{children}</View>
    </StackScreenChrome>
  );
}

const styles = StyleSheet.create({
  loader: {
    padding: Spacing.md,
  },
});
