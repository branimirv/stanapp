import type { LucideIcon } from 'lucide-react-native';
import { Plus, X } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

export type AppFabAction = {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
};

type AppFabGroupProps = {
  actions: AppFabAction[];
  style?: StyleProp<ViewStyle>;
  fabStyle?: StyleProp<ViewStyle>;
  className?: string;
};

export function AppFabGroup({ actions, style, fabStyle, className }: AppFabGroupProps) {
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  const handleActionPress = useCallback(
    (onPress: () => void) => {
      onPress();
      close();
    },
    [close],
  );

  return (
    <View
      pointerEvents="box-none"
      className={cn('absolute inset-0 items-end justify-end', className)}
      style={style}
    >
      {open ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close menu"
          onPress={close}
          className="absolute inset-0 bg-black/40"
        />
      ) : null}

      {open ? (
        <View pointerEvents="box-none" className="mb-4 mr-4 items-end gap-4">
          {actions.map((action) => {
            const ActionIcon = action.icon;
            return (
              <Pressable
                key={action.label}
                accessibilityRole="button"
                accessibilityLabel={action.label}
                onPress={() => handleActionPress(action.onPress)}
                className="flex-row items-center gap-2 active:opacity-85"
              >
                <View className="bg-card rounded-xl px-4 py-2 shadow-sm">
                  <Text className="text-base font-medium">{action.label}</Text>
                </View>
                <View className="bg-accent h-10 w-10 items-center justify-center rounded-full shadow-sm">
                  <ActionIcon size={24} color="#1E40AF" strokeWidth={2} />
                </View>
              </Pressable>
            );
          })}
        </View>
      ) : null}

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen((value) => !value)}
        className="bg-primary mr-4 h-14 w-14 items-center justify-center rounded-2xl shadow-lg active:opacity-90"
        style={fabStyle}
      >
        <Icon
          as={open ? X : Plus}
          size={24}
          className="text-primary-foreground"
          strokeWidth={2}
        />
      </Pressable>
    </View>
  );
}
