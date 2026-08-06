import { createContext, useContext, useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  FloatingStackHeader,
  useFloatingStackHeaderInset,
} from '@/components/ui/FloatingStackHeader';
import { GlassSurface } from '@/components/ui/GlassSurface';
import { ScreenPageTitle } from '@/components/ui/ScreenPageTitle';

/** When set, scroll shells (e.g. AppFormScroll) should pad content under the floating header. */
const StackChromeEdgeInsetContext = createContext<number | null>(null);

export function useStackChromeEdgeInset() {
  return useContext(StackChromeEdgeInsetContext);
}

/** Fallback until sticky title `onLayout` measures — ~1 line title + padding. */
const STICKY_TITLE_FALLBACK = 52;

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
 * With `edgeToEdge`, the page title becomes a sticky liquid-glass bar so form
 * fields can scroll underneath and stay readable.
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
  const [stickyTitleHeight, setStickyTitleHeight] = useState(STICKY_TITLE_FALLBACK);

  const useStickyGlassTitle = edgeToEdge && showPageTitle;
  const scrollEdgeInset = edgeToEdge
    ? inset + (useStickyGlassTitle ? stickyTitleHeight : 0)
    : null;
  const contentPadTop = edgeToEdge ? undefined : inset;

  return (
    <StackChromeEdgeInsetContext.Provider value={scrollEdgeInset}>
      <View className="flex-1 bg-transparent" collapsable={false}>
        <FloatingStackHeader title={title} hideTitle right={right} />

        {useStickyGlassTitle ? (
          <View
            pointerEvents="box-none"
            style={[styles.stickyTitle, { top: inset }]}
            onLayout={(event) => {
              const next = Math.ceil(event.nativeEvent.layout.height);
              if (next > 0 && next !== stickyTitleHeight) {
                setStickyTitleHeight(next);
              }
            }}
          >
            <GlassSurface shape="rect" style={styles.stickyGlass} contentStyle={styles.stickyGlassContent}>
              <ScreenPageTitle>{title}</ScreenPageTitle>
            </GlassSurface>
          </View>
        ) : null}

        <View
          className="flex-1"
          style={contentPadTop != null ? { paddingTop: contentPadTop } : undefined}
        >
          {showPageTitle && !useStickyGlassTitle ? (
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

const styles = StyleSheet.create({
  stickyTitle: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 15,
    elevation: 15,
    paddingHorizontal: 16,
  },
  stickyGlass: {
    // Keep a real radius — full-bleed radius 0 can mute / crash liquid glass.
  },
  stickyGlassContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
});
