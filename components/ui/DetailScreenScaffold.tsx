import type { ReactNode } from 'react';
import { View } from 'react-native';

import { ErrorState } from '@/components/ui/ErrorState';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { StackScreenChrome } from '@/components/ui/StackScreenChrome';

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
  /** Hide floating back/actions while a sheet/modal covers the screen. */
  chromeHidden?: boolean;
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
  chromeHidden = false,
  children,
}: DetailScreenScaffoldProps) {
  if (isLoading) {
    return (
      <StackScreenChrome
        title={title}
        hideHeaderTitle={hideHeaderTitle}
        edgeToEdge={edgeToEdge}
        chromeHidden={chromeHidden}
      >
        <SkeletonLoader count={loaderCount} className="p-4" />
      </StackScreenChrome>
    );
  }

  if (error || !isReady) {
    return (
      <StackScreenChrome
        title={title}
        hideHeaderTitle={hideHeaderTitle}
        edgeToEdge={edgeToEdge}
        chromeHidden={chromeHidden}
      >
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
      chromeHidden={chromeHidden}
    >
      <View className="flex-1">{children}</View>
    </StackScreenChrome>
  );
}
