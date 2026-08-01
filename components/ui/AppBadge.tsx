import {
  CircleAlert,
  CircleCheck,
  CircleDashed,
  Clock3,
  type LucideIcon,
} from 'lucide-react-native';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { Text } from '@/components/ui/text';
import { Colors } from '@/constants/theme';
import { cn } from '@/lib/utils';
import type { PaymentStatus } from '@/types/app.types';
import { getStatusColor } from '@/utils/formatters';

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

function resolveBadgeColors(
  variant: AppBadgeVariant,
  customColor?: string,
): { background: string; text: string } {
  if (customColor) {
    return {
      background: `${customColor}22`,
      text: customColor,
    };
  }

  const paymentStatuses: PaymentStatus[] = ['paid', 'pending', 'late', 'partial'];
  if (paymentStatuses.includes(variant as PaymentStatus)) {
    const color = getStatusColor(variant as PaymentStatus);
    return { background: `${color}22`, text: color };
  }

  switch (variant) {
    case 'success':
      return { background: `${Colors.accent}22`, text: Colors.accent };
    case 'warning':
      return { background: `${Colors.warning}22`, text: Colors.warning };
    case 'error':
      return { background: `${Colors.danger}22`, text: Colors.danger };
    case 'info':
      return { background: Colors.primaryLight, text: Colors.primary };
    case 'default':
    default:
      return { background: Colors.surfaceVariant, text: Colors.textSecondary };
  }
}

export function AppBadge({
  label,
  variant = 'default',
  color,
  style,
  className,
}: AppBadgeProps) {
  const { background, text } = resolveBadgeColors(variant, color);
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
