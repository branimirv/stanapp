import type { ReactNode } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';

/**
 * Solid Naslov `--bg` canvas for the app root and native tab scenes.
 * NativeTabs paints opaque scenes that hide the root fill, so each tab
 * layout wraps with this. Ambient brand wash removed — mockups are flat `--bg`.
 */
export function AppScreenBackground({ children }: { children: ReactNode }) {
  const { theme } = useAppTheme();

  return (
    <View
      className="flex-1"
      collapsable={false}
      style={{ backgroundColor: theme.colors.bg }}
    >
      <View style={styles.content}>{children}</View>
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
  content: {
    flex: 1,
  },
});
