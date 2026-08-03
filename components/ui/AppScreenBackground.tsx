import type { ReactNode } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { ScreenAmbient } from '@/components/ui/ScreenAmbient';
import { Colors } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';

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
  const { isDark } = useAppTheme();

  return (
    <View
      className="flex-1"
      collapsable={false}
      style={{ backgroundColor: isDark ? Colors.backgroundDark : Colors.background }}
    >
      {withAmbient ? <ScreenAmbient /> : null}
      <View style={styles.content}>{children}</View>
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

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
});
