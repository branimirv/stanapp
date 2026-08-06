import { Pressable, StyleSheet, View } from 'react-native';
import type { NavigationState, SceneRendererProps } from 'react-native-tab-view';

import { GlassSurface } from '@/components/ui/GlassSurface';
import { Text } from '@/components/ui/text';
import { Spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Fonts } from '@/lib/fonts';

export interface PropertyTabBarProps extends SceneRendererProps {
  navigationState: NavigationState<{ key: string; title?: string }>;
}

/** Height of the floating segs row (padding + track). */
export const PROPERTY_TAB_BAR_HEIGHT = 40 + Spacing.sm * 2 + Spacing.xs;

/** Extra space between floating tabs and scene content. */
export const PROPERTY_SCENE_TOP_GAP = Spacing.md;

/** Naslov `.segs` nav — liquid-glass track, surface3 selected (not picker primary). */
export function PropertyTabBar({ navigationState, jumpTo }: PropertyTabBarProps) {
  const { theme } = useAppTheme();
  const { colors } = theme;
  const { routes, index: selectedIndex } = navigationState;

  return (
    <View pointerEvents="box-none" style={styles.wrap}>
      <GlassSurface
        shape="pill"
        interactive
        style={styles.track}
        contentStyle={styles.trackContent}
      >
        {routes.map((route, routeIndex) => {
          const isFocused = selectedIndex === routeIndex;
          return (
            <Pressable
              key={route.key}
              onPress={() => jumpTo(route.key)}
              style={[
                styles.seg,
                isFocused ? { backgroundColor: colors.surface3 } : null,
              ]}
              accessibilityRole="tab"
              accessibilityState={{ selected: isFocused }}
            >
              <Text
                style={{
                  fontFamily: Fonts.sans.semibold,
                  fontSize: 12,
                  letterSpacing: -0.12,
                  color: isFocused ? colors.fg : colors.muted,
                  textAlign: 'center',
                }}
                numberOfLines={1}
              >
                {route.title}
              </Text>
            </Pressable>
          );
        })}
      </GlassSurface>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  track: {
    minHeight: 40,
  },
  trackContent: {
    flexDirection: 'row',
    gap: 5,
    padding: 4,
    minHeight: 40,
  },
  seg: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 999,
  },
});
