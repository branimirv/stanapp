import { AlertTriangle, Clock, Wallet } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { useAppTheme } from '@/hooks/useAppTheme';

export type AlertBannerVariant = 'danger' | 'warning' | 'info';

export interface AlertBannerProps {
  variant: AlertBannerVariant;
  title: string;
  message: string;
  actionLabel?: string;
  icon?: LucideIcon;
  onPress?: () => void;
}

const defaultIcons: Record<AlertBannerVariant, LucideIcon> = {
  danger: AlertTriangle,
  warning: Clock,
  info: Wallet,
};

export function AlertBanner({
  variant,
  title,
  message,
  actionLabel,
  icon,
  onPress,
}: AlertBannerProps) {
  const { theme, isDark } = useAppTheme();
  const { colors } = theme;

  const palette = {
    danger: {
      bgLight: '#FEF2F2',
      bgDark: '#1A0A0C',
      border: colors.neg,
      text: colors.neg,
      textDark: '#FCA5A5',
    },
    warning: {
      bgLight: '#FFFBEB',
      bgDark: '#1A1408',
      border: colors.chart[4],
      text: '#B45309',
      textDark: '#FCD34D',
    },
    info: {
      bgLight: '#EFF6FF',
      bgDark: '#0A1628',
      border: colors.primary,
      text: colors.primary,
      textDark: '#93C5FD',
    },
  }[variant];

  const Icon = icon ?? defaultIcons[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      className="mb-4 flex-row items-center gap-4 rounded-xl border p-4"
      style={{
        backgroundColor: isDark ? palette.bgDark : palette.bgLight,
        borderColor: palette.border,
      }}
      accessibilityRole="button"
    >
      <View
        className="h-10 w-10 items-center justify-center rounded-full"
        style={{ backgroundColor: `${palette.border}22` }}
      >
        <Icon size={22} color={palette.border} strokeWidth={2} />
      </View>

      <View className="flex-1 gap-0.5">
        <Text className="text-base font-medium" style={{ color: palette.border }}>
          {title}
        </Text>
        <Text className="text-xs" style={{ color: isDark ? palette.textDark : palette.text }}>
          {message}
        </Text>
      </View>

      {onPress && actionLabel ? (
        <Text className="text-sm font-medium" style={{ color: palette.border }}>
          {actionLabel}
        </Text>
      ) : null}
    </Pressable>
  );
}
