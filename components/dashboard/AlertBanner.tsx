import { AlertTriangle, Clock, Wallet } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { Colors, Spacing, Typography } from '@/constants/theme';

export type AlertBannerVariant = 'danger' | 'warning' | 'info';

export interface AlertBannerProps {
  variant: AlertBannerVariant;
  title: string;
  message: string;
  actionLabel?: string;
  icon?: LucideIcon;
  onPress?: () => void;
}

const variantStyles: Record<
  AlertBannerVariant,
  { bgLight: string; bgDark: string; border: string; text: string; textDark: string }
> = {
  danger: {
    bgLight: '#FEF2F2',
    bgDark: '#1A0A0C',
    border: Colors.danger,
    text: Colors.danger,
    textDark: '#FCA5A5',
  },
  warning: {
    bgLight: '#FFFBEB',
    bgDark: '#1A1408',
    border: Colors.warning,
    text: '#B45309',
    textDark: '#FCD34D',
  },
  info: {
    bgLight: '#EFF6FF',
    bgDark: '#0A1628',
    border: Colors.primary,
    text: Colors.primary,
    textDark: '#93C5FD',
  },
};

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
  const theme = useTheme();
  const styles = variantStyles[variant];
  const Icon = icon ?? defaultIcons[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={[
        bannerStyles.container,
        {
          backgroundColor: theme.dark ? styles.bgDark : styles.bgLight,
          borderColor: styles.border,
        },
      ]}
      accessibilityRole="button"
    >
      <View style={[bannerStyles.iconWrap, { backgroundColor: `${styles.border}22` }]}>
        <Icon size={22} color={styles.border} strokeWidth={2} />
      </View>

      <View style={bannerStyles.content}>
        <Text style={[bannerStyles.title, { color: styles.border }]}>{title}</Text>
        <Text style={[bannerStyles.message, { color: theme.dark ? styles.textDark : styles.text }]}>
          {message}
        </Text>
      </View>

      {onPress && actionLabel ? (
        <Text style={[bannerStyles.action, { color: styles.border }]}>{actionLabel}</Text>
      ) : null}
    </Pressable>
  );
}

const bannerStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...Typography.titleMedium,
  },
  message: {
    ...Typography.bodySmall,
  },
  action: {
    ...Typography.labelLarge,
  },
});
