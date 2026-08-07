import type { LucideIcon } from 'lucide-react-native';
import { Inbox } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { displayFontFamily, Fonts } from '@/lib/fonts';
import { cn } from '@/lib/utils';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaIcon?: LucideIcon;
  onCtaPress?: () => void;
  /** Tighter padding for nested chart / list slots. */
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

/**
 * Naslov empty card — icon well, display title, muted hint, optional pill CTA.
 */
export function EmptyState({
  icon: Icon = Inbox,
  title,
  subtitle,
  ctaLabel,
  ctaIcon: CtaIcon,
  onCtaPress,
  compact = false,
  style,
  className,
}: EmptyStateProps) {
  const { theme } = useAppTheme();
  const { colors, radius, elevation } = theme;
  const showCta = Boolean(ctaLabel && onCtaPress);

  return (
    <View
      className={cn(className)}
      style={[
        styles.card,
        compact ? styles.cardCompact : null,
        {
          backgroundColor: colors.surface,
          borderColor: colors.cardBd,
          borderRadius: radius.xl,
          ...elevation.card,
        },
        style,
      ]}
    >
      <View style={[styles.iconWell, { backgroundColor: colors.primaryTint }]}>
        <Icon size={25} color={colors.primary} strokeWidth={2} />
      </View>

      <Text
        style={{
          fontFamily: displayFontFamily(theme.name),
          fontSize: compact ? 18 : 23,
          letterSpacing: compact ? -0.36 : -0.46,
          color: colors.fg,
          textAlign: 'center',
          marginBottom: 8,
        }}
      >
        {title}
      </Text>

      {subtitle ? (
        <Text
          style={{
            fontFamily: Fonts.sans.regular,
            fontSize: 12.5,
            lineHeight: 20,
            color: colors.muted,
            textAlign: 'center',
            maxWidth: 230,
            marginBottom: showCta ? 22 : 0,
          }}
        >
          {subtitle}
        </Text>
      ) : null}

      {showCta ? (
        <Pressable
          onPress={onCtaPress}
          accessibilityRole="button"
          accessibilityLabel={ctaLabel}
          style={[styles.cta, { backgroundColor: colors.primary }]}
        >
          {CtaIcon ? <CtaIcon size={18} color={colors.onPrimary} strokeWidth={2} /> : null}
          <Text
            style={{
              fontFamily: Fonts.sans.semibold,
              fontSize: 14,
              letterSpacing: -0.14,
              color: colors.onPrimary,
            }}
          >
            {ctaLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingTop: 38,
    paddingHorizontal: 20,
    paddingBottom: 34,
    alignItems: 'center',
    borderWidth: 1,
  },
  cardCompact: {
    paddingTop: 28,
    paddingBottom: 24,
  },
  iconWell: {
    width: 60,
    height: 60,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  cta: {
    height: 44,
    paddingHorizontal: 18,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
