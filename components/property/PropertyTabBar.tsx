import type { LucideIcon } from 'lucide-react-native';
import { Pressable, View } from 'react-native';
import type { NavigationState, SceneRendererProps } from 'react-native-tab-view';

import { Icon as UiIcon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

export interface PropertyTabBarProps extends SceneRendererProps {
  navigationState: NavigationState<{ key: string; title?: string }>;
  icons: Record<string, LucideIcon>;
}

export function PropertyTabBar({ navigationState, jumpTo, icons }: PropertyTabBarProps) {
  return (
    <View className="bg-background border-border flex-row border-b">
      {navigationState.routes.map((route, index) => {
        const isFocused = navigationState.index === index;
        const RouteIcon = icons[route.key];

        return (
          <Pressable
            key={route.key}
            className={cn(
              'min-h-13 flex-1 items-center justify-center gap-0.5 px-1 py-2',
              isFocused && 'border-primary border-b-2',
            )}
            onPress={() => jumpTo(route.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isFocused }}
          >
            {RouteIcon ? (
              <UiIcon
                as={RouteIcon}
                size={20}
                className={isFocused ? 'text-primary' : 'text-muted-foreground'}
                strokeWidth={2}
              />
            ) : null}
            <Text
              className={cn(
                'text-center text-[11px] font-medium',
                isFocused ? 'text-primary font-semibold' : 'text-muted-foreground',
              )}
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
