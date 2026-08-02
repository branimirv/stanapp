import { createContext, useContext, type ReactNode } from 'react';
import { View } from 'react-native';

import {
  FloatingStackHeader,
  useFloatingStackHeaderInset,
} from '@/components/ui/FloatingStackHeader';

/** When set, scroll shells (e.g. AppFormScroll) should pad content under the floating header. */
const StackChromeEdgeInsetContext = createContext<number | null>(null);

export function useStackChromeEdgeInset() {
  return useContext(StackChromeEdgeInsetContext);
}

interface StackScreenChromeProps {
  title: string;
  /** Hide nav title when the screen owns a page title below chrome. */
  hideHeaderTitle?: boolean;
  right?: ReactNode;
  /** When true, children fill under the floating header (no top pad). */
  edgeToEdge?: boolean;
  children: ReactNode;
}

/**
 * Edge-to-edge stack screen shell: floating back/title/actions over content.
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

  return (
    <StackChromeEdgeInsetContext.Provider value={edgeToEdge ? inset : null}>
      <View className="flex-1 bg-transparent" collapsable={false}>
        <FloatingStackHeader title={title} hideTitle={hideHeaderTitle} right={right} />
        <View className="flex-1" style={edgeToEdge ? undefined : { paddingTop: inset }}>
          {children}
        </View>
      </View>
    </StackChromeEdgeInsetContext.Provider>
  );
}
