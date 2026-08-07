import type { ReactNode } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';

/**
 * Solid Naslov `--bg` canvas for the app root and native tab scenes.
 * NativeTabs paints opaque scenes that hide the root fill, so each tab
 * layout wraps with this. Ambient brand wash removed — mockups are flat `--bg`.
 *
 * Layout uses StyleSheet `flex: 1` (not className). If Uniwind theme cache
 * misses, `className="flex-1"` resolves to {} and the whole tree collapses
 * to zero height — boot (absoluteFill) still shows, then a blank canvas.
 */
export function AppScreenBackground({ children }: { children: ReactNode }) {
  const { theme } = useAppTheme();

  return (
    <View
      collapsable={false}
      style={[styles.fill, { backgroundColor: theme.colors.bg }]}
    >
      <View style={styles.fill}>{children}</View>
    </View>
  );
}

/** Tab-stack shell: solid fill on native (web uses the root canvas). */
export function TabScreenBackground({ children }: { children: ReactNode }) {
  if (Platform.OS === 'web') {
    return <>{children}</>;
  }

  return <AppScreenBackground>{children}</AppScreenBackground>;
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
});
