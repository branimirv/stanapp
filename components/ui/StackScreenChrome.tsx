import { createContext, useContext, type ReactNode } from 'react';
import { View } from 'react-native';

import {
  FloatingStackHeader,
  useFloatingStackHeaderInset,
} from '@/components/ui/FloatingStackHeader';
import { ScreenPageTitle } from '@/components/ui/ScreenPageTitle';

/** When set, scroll shells (e.g. AppFormScroll) should pad content under the floating header. */
const StackChromeEdgeInsetContext = createContext<number | null>(null);

export function useStackChromeEdgeInset() {
  return useContext(StackChromeEdgeInsetContext);
}

interface StackScreenChromeProps {
  title: string;
  /**
   * When true, the floating header stays title-less and StackScreenChrome does not
   * inject a page title — the screen owns its own (e.g. property detail).
   * When false (default), the title renders in content below the chrome.
   */
  hideHeaderTitle?: boolean;
  right?: ReactNode;
  /** When true, children fill under the floating header (no top pad). */
  edgeToEdge?: boolean;
  children: ReactNode;
}

/**
 * Edge-to-edge stack screen shell: floating back/actions over content.
 * Titles live in content by default so long strings can wrap.
 * Ambient brand wash comes from root / tab `AppScreenBackground`.
 */
export function StackScreenChrome({
  title,
  hideHeaderTitle = false,
  right,
  edgeToEdge = false,
  children,
}: StackScreenChromeProps) {
  const inset = useFloatingStackHeaderInset();
  const showPageTitle = !hideHeaderTitle;
  // Page title already clears the floating header — scroll shells should not re-pad.
  const scrollEdgeInset = edgeToEdge && !showPageTitle ? inset : null;
  const contentPadTop = showPageTitle || !edgeToEdge ? inset : undefined;

  return (
    <StackChromeEdgeInsetContext.Provider value={scrollEdgeInset}>
      <View className="flex-1 bg-transparent" collapsable={false}>
        <FloatingStackHeader title={title} hideTitle right={right} />
        <View
          className="flex-1"
          style={contentPadTop != null ? { paddingTop: contentPadTop } : undefined}
        >
          {showPageTitle ? (
            <View className="px-4 pt-3 pb-0.5">
              <ScreenPageTitle>{title}</ScreenPageTitle>
            </View>
          ) : null}
          <View className="flex-1">{children}</View>
        </View>
      </View>
    </StackChromeEdgeInsetContext.Provider>
  );
}
