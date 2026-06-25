import type { LucideIcon } from 'lucide-react-native';
import { Inbox } from 'lucide-react-native';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { AppButton } from '@/components/ui/AppButton';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  onCtaPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  subtitle,
  ctaLabel,
  onCtaPress,
  style,
}: EmptyStateProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.iconWrap,
          { backgroundColor: theme.dark ? Colors.surfaceVariantDark : Colors.primaryLight },
        ]}
      >
        <Icon
          size={40}
          color={theme.colors.primary}
          strokeWidth={1.75}
        />
      </View>

      <Text style={[styles.title, { color: theme.colors.onSurface }]}>{title}</Text>

      {subtitle ? (
        <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
          {subtitle}
        </Text>
      ) : null}

      {ctaLabel && onCtaPress ? (
        <AppButton mode="contained" onPress={onCtaPress} style={styles.cta}>
          {ctaLabel}
        </AppButton>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxl,
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    ...Typography.titleLarge,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.bodyMedium,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  cta: {
    marginTop: Spacing.sm,
    minWidth: 160,
  },
});
