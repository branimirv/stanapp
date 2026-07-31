import { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GlassSurface } from '@/components/ui/GlassSurface';
import { getGlassActiveIndicatorColor } from '@/constants/glass';
import { Spacing } from '@/constants/theme';

type GlassTabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

const TAB_BAR_HEIGHT = 60;
const TAB_BAR_HORIZONTAL_MARGIN = Spacing.lg;
const TAB_BAR_BOTTOM_OFFSET = Spacing.sm;
const TAB_BAR_SCROLL_PADDING = TAB_BAR_HEIGHT + TAB_BAR_BOTTOM_OFFSET + Spacing.lg;
const TAB_BAR_FAB_OFFSET = TAB_BAR_HEIGHT + TAB_BAR_BOTTOM_OFFSET + Spacing.md;

export function getGlassTabBarScrollPadding(bottomInset: number) {
  return bottomInset + TAB_BAR_SCROLL_PADDING;
}

export function getGlassTabBarFabBottom(bottomInset: number) {
  return bottomInset + TAB_BAR_FAB_OFFSET;
}

export function GlassTabBar({ state, descriptors, navigation }: GlassTabBarProps) {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const activeIndicatorColor = getGlassActiveIndicatorColor(theme.dark);

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.container,
        {
          bottom: insets.bottom + TAB_BAR_BOTTOM_OFFSET,
          left: TAB_BAR_HORIZONTAL_MARGIN,
          right: TAB_BAR_HORIZONTAL_MARGIN,
        },
      ]}
    >
      <GlassSurface shape="pill" style={styles.bar} contentStyle={styles.barOverlay}>
        <View style={styles.tabs}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;
            const label = options.title ?? route.name;
            const color = isFocused ? theme.colors.primary : theme.colors.onSurfaceVariant;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            };

            const onLongPress = () => {
              navigation.emit({
                type: 'tabLongPress',
                target: route.key,
              });
            };

            return (
              <Pressable
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                onPress={onPress}
                onLongPress={onLongPress}
                style={styles.tab}
              >
                <View style={styles.tabInner}>
                  {isFocused ? (
                    <View
                      pointerEvents="none"
                      style={[styles.activeIndicator, { backgroundColor: activeIndicatorColor }]}
                    />
                  ) : null}
                  <View style={styles.iconWrap}>
                    {options.tabBarIcon?.({ focused: isFocused, color, size: 20 })}
                  </View>
                  <Text style={[styles.label, { color }]} numberOfLines={1}>
                    {label}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </GlassSurface>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    height: TAB_BAR_HEIGHT,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 10,
  },
  bar: {
    flex: 1,
  },
  barOverlay: {
    flex: 1,
  },
  tabs: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingHorizontal: Spacing.xs,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabInner: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  iconWrap: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIndicator: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: 999,
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
    lineHeight: 12,
  },
});
