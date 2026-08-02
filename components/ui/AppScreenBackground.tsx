import type { ReactNode } from 'react';
import { Platform, View } from 'react-native';

import { ScreenAmbient } from '@/components/ui/ScreenAmbient';

/**
 * Solid canvas + brand wash for the app root and native tab scenes.
 * NativeTabs paints opaque scenes that hide the root ambient, so each tab
 * layout wraps with this. On web, JS tabs stay transparent to the root wash.
 */
export function AppScreenBackground({
  children,
  withAmbient = true,
}: {
  children: ReactNode;
  withAmbient?: boolean;
}) {
  return (
    <View className="bg-background flex-1" collapsable={false}>
      {withAmbient ? <ScreenAmbient /> : null}
      {children}
    </View>
  );
}

/** Tab-stack shell: local ambient on native only (web uses the root wash). */
export function TabScreenBackground({ children }: { children: ReactNode }) {
  if (Platform.OS === 'web') {
    return <>{children}</>;
  }

  return <AppScreenBackground>{children}</AppScreenBackground>;
}
