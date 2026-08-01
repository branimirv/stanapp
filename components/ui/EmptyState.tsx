import type { LucideIcon } from 'lucide-react-native';
import { Inbox } from 'lucide-react-native';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { Text } from '@/components/ui/text';
import { Colors } from '@/constants/theme';
import { cn } from '@/lib/utils';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  onCtaPress?: () => void;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  subtitle,
  ctaLabel,
  onCtaPress,
  style,
  className,
}: EmptyStateProps) {
  return (
    <View
      className={cn('flex-1 items-center justify-center px-8 py-12', className)}
      style={style}
    >
      <View className="mb-6 h-20 w-20 items-center justify-center rounded-full bg-accent">
        <Icon size={40} color={Colors.primary} strokeWidth={1.75} />
      </View>

      <Text className="mb-2 text-center text-lg font-semibold">{title}</Text>

      {subtitle ? (
        <Text className="text-muted-foreground mb-6 text-center text-sm">{subtitle}</Text>
      ) : null}

      {ctaLabel && onCtaPress ? (
        <AppButton mode="contained" onPress={onCtaPress} className="mt-2 min-w-40">
          {ctaLabel}
        </AppButton>
      ) : null}
    </View>
  );
}
