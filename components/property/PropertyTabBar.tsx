import type { LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import type { NavigationState, SceneRendererProps } from 'react-native-tab-view';
import { Spacing, Typography } from '@/constants/theme';

export interface PropertyTabBarProps extends SceneRendererProps {
  navigationState: NavigationState<{ key: string; title?: string }>;
  icons: Record<string, LucideIcon>;
}

export function PropertyTabBar({ navigationState, jumpTo, icons }: PropertyTabBarProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderBottomColor: theme.colors.outline,
        },
      ]}
    >
      {navigationState.routes.map((route, index) => {
        const isFocused = navigationState.index === index;
        const Icon = icons[route.key];
        const color = isFocused ? theme.colors.primary : theme.colors.onSurfaceVariant;

        return (
          <Pressable
            key={route.key}
            style={[
              styles.tab,
              isFocused && {
                borderBottomColor: theme.colors.primary,
                borderBottomWidth: 2,
              },
            ]}
            onPress={() => jumpTo(route.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isFocused }}
          >
            {Icon ? <Icon size={18} color={color} strokeWidth={2} /> : null}
            <Text
              style={[styles.label, { color }, isFocused && styles.labelActive]}
              numberOfLines={1}
            >
              {route.title}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    gap: 2,
    minHeight: 52,
  },
  label: {
    ...Typography.labelSmall,
    textAlign: 'center',
  },
  labelActive: {
    fontWeight: '600',
  },
});
