import type { LucideIcon } from 'lucide-react-native';
import { Plus } from 'lucide-react-native';
import { Pressable, type StyleProp, type ViewStyle } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

type AppFabProps = {
  icon?: LucideIcon;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  className?: string;
  accessibilityLabel?: string;
  visible?: boolean;
};

export function AppFab({
  icon: FabIcon = Plus,
  onPress,
  style,
  className,
  accessibilityLabel,
  visible = true,
}: AppFabProps) {
  if (!visible) return null;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      className={cn(
        'bg-primary mr-4 h-14 w-14 items-center justify-center rounded-2xl shadow-lg active:opacity-90',
        className,
      )}
      style={style}
    >
      <Icon as={FabIcon} size={24} className="text-primary-foreground" strokeWidth={2} />
    </Pressable>
  );
}
