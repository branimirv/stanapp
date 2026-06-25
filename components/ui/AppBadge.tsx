import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { Colors, Spacing, Typography } from '@/constants/theme';
import type { PaymentStatus } from '@/types/app.types';
import { getStatusColor } from '@/utils/formatters';

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
      return { background: `${Colors.primaryLight}`, text: Colors.primary };
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
}: AppBadgeProps) {
  const theme = useTheme();
  const { background, text } = resolveBadgeColors(variant, color);

  const resolvedBackground =
    variant === 'default' && theme.dark ? Colors.surfaceVariantDark : background;

  return (
    <View style={[styles.badge, { backgroundColor: resolvedBackground }, style]}>
      <Text style={[styles.label, { color: text }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.xs,
    maxWidth: '100%',
  },
  label: {
    ...Typography.labelMedium,
  },
});
