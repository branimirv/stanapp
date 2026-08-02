import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import type { NavigationState, SceneRendererProps } from 'react-native-tab-view';

import { GlassSurface } from '@/components/ui/GlassSurface';
import { Text } from '@/components/ui/text';
import { Spacing } from '@/constants/theme';
import { cn } from '@/lib/utils';

export interface PropertyTabBarProps extends SceneRendererProps {
  navigationState: NavigationState<{ key: string; title?: string }>;
}

/** Height of the floating pill row (padding + pill). */
export const PROPERTY_TAB_BAR_HEIGHT = 38 + Spacing.sm * 2 + Spacing.xs;

/**
 * Full-width page title under the nav (up to 2 lines).
 * text-2xl lineHeight 32 × 2 + vertical padding.
 */
export const PROPERTY_PAGE_TITLE_HEIGHT = 32 * 2 + Spacing.sm + Spacing.xs;

/** Extra space between floating tabs and scene content. */
export const PROPERTY_SCENE_TOP_GAP = Spacing.md;

export function PropertyTabBar({ navigationState, jumpTo }: PropertyTabBarProps) {
  const { routes, index: selectedIndex } = navigationState;

  return (
    <View pointerEvents="box-none" className="bg-transparent">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.pillRow}
      >
        {routes.map((route, routeIndex) => {
          const isFocused = selectedIndex === routeIndex;

          if (isFocused) {
            return (
              <Pressable
                key={route.key}
                onPress={() => jumpTo(route.key)}
                style={({ pressed }) => [styles.pill, { opacity: pressed ? 0.9 : 1 }]}
                className="bg-primary"
                accessibilityRole="tab"
                accessibilityState={{ selected: true }}
              >
                <Text
                  className="text-primary-foreground text-center text-sm font-bold"
                  numberOfLines={1}
                >
                  {route.title}
                </Text>
              </Pressable>
            );
          }

          return (
            <Pressable
              key={route.key}
              onPress={() => jumpTo(route.key)}
              accessibilityRole="tab"
              accessibilityState={{ selected: false }}
            >
              {/* Avoid opacity on press — it kills native liquid glass rendering. */}
              <GlassSurface shape="pill" interactive contentStyle={styles.glassPill}>
                <Text
                  className={cn('text-center text-sm font-medium text-foreground')}
                  numberOfLines={1}
                >
                  {route.title}
                </Text>
              </GlassSurface>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  pillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  pill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 999,
    minHeight: 38,
    justifyContent: 'center',
  },
  glassPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minHeight: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
