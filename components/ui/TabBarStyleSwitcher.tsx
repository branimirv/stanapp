import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Text } from '@/components/ui/text';
import { useTabBarPreference, type TabBarLabelMode } from '@/hooks/useTabBarPreference';
import { cn } from '@/lib/utils';

const OPTIONS: Array<{ value: TabBarLabelMode; labelKey: string }> = [
  { value: 'iconAndLabel', labelKey: 'settings.tabBarIconAndLabel' },
  { value: 'iconOnly', labelKey: 'settings.tabBarIconOnly' },
];

interface TabBarStyleSwitcherProps {
  onPersist?: (mode: TabBarLabelMode) => void;
}

export function TabBarStyleSwitcher({ onPersist }: TabBarStyleSwitcherProps) {
  const { t } = useTranslation();
  const { labelMode, setLabelMode } = useTabBarPreference();

  const handleChange = async (mode: TabBarLabelMode) => {
    await setLabelMode(mode);
    onPersist?.(mode);
  };

  return (
    <View className="gap-1">
      {OPTIONS.map((option) => {
        const selected = labelMode === option.value;

        return (
          <Pressable
            key={option.value}
            onPress={() => handleChange(option.value)}
            className="min-h-11 flex-row items-center gap-1"
            accessibilityRole="radio"
            accessibilityState={{ selected }}
          >
            <View
              className={cn(
                'mr-2 h-5 w-5 items-center justify-center rounded-full border-2',
                selected ? 'border-primary' : 'border-muted-foreground',
              )}
            >
              {selected ? <View className="bg-primary h-2.5 w-2.5 rounded-full" /> : null}
            </View>
            <Text className="flex-1">{t(option.labelKey)}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
