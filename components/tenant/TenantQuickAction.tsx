import type { LucideIcon } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';

type TenantQuickActionProps = {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
  accessibilityLabel: string;
};

/** Circular icon + label action under the tenant hero. */
export function TenantQuickAction({
  icon: Icon,
  label,
  onPress,
  accessibilityLabel,
}: TenantQuickActionProps) {
  const { theme } = useAppTheme();
  const { colors } = theme;

  return (
    <Pressable
      onPress={onPress}
      className="flex-1 items-center gap-2.25"
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <View className="bg-surface-2 h-12 w-12 items-center justify-center rounded-full">
        <Icon size={20} color={colors.primary} strokeWidth={2} />
      </View>
      <Text
        className="text-muted text-center text-[10px] font-semibold tracking-[0.8px] uppercase"
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
}
