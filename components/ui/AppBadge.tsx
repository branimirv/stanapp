import {
  CircleAlert,
  CircleCheck,
  CircleDashed,
  Clock3,
  type LucideIcon,
} from 'lucide-react-native';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { Text } from '@/components/ui/text';
import { useAppTheme } from '@/hooks/useAppTheme';
import { cn } from '@/lib/utils';
import type { PaymentStatus } from '@/types/app.types';

const PAYMENT_STATUS_ICONS: Record<PaymentStatus, LucideIcon> = {
  paid: CircleCheck,
  pending: Clock3,
  late: CircleAlert,
  partial: CircleDashed,
};

export type AppBadgeVariant =
  | PaymentStatus
  | 'default'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'paid'
  | 'pending'
  | 'late'
  | 'partial';

export interface AppBadgeProps {
  label: string;
  variant?: AppBadgeVariant;
  color?: string;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

export function AppBadge({
  label,
  variant = 'default',
  color,
  style,
  className,
}: AppBadgeProps) {
  const { theme } = useAppTheme();
  const { colors } = theme;

  let text = colors.muted;
  let background = colors.surface2;

  if (color) {
    text = color;
    background = `${color}22`;
  } else if (variant === 'paid' || variant === 'success') {
    text = colors.pos;
    background = colors.posTint;
  } else if (variant === 'late' || variant === 'error') {
    text = colors.neg;
    background = colors.negTint;
  } else if (variant === 'pending' || variant === 'partial' || variant === 'info') {
    text = colors.primary;
    background = colors.primaryTint;
  } else if (variant === 'warning') {
    text = colors.chart[4];
    background = colors.chartTint[4];
  }

  const StatusIcon = PAYMENT_STATUS_ICONS[variant as PaymentStatus];

  return (
    <View
      className={cn(
        'max-w-full flex-row items-center gap-1 self-start rounded-full px-2.5 py-1',
        className,
      )}
      style={[{ backgroundColor: background }, style]}
    >
      {StatusIcon ? <StatusIcon size={14} color={text} strokeWidth={2} /> : null}
      <Text className="text-xs font-medium" style={{ color: text }} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}
