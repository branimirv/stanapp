import type { LucideIcon } from 'lucide-react-native';
import { Inbox } from 'lucide-react-native';
import { Pressable, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { displayFontFamily } from '@/lib/fonts';
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
  const { colors, elevation } = theme;
  const showCta = Boolean(ctaLabel && onCtaPress);

  return (
    <View
      className={cn(
        'border-card-bd bg-surface items-center rounded-xl border px-5',
        compact ? 'pt-7 pb-6' : 'pt-[38px] pb-[34px]',
        className,
      )}
      style={[elevation.card, style]}
    >
      <View className="bg-primary-tint mb-3.5 h-[60px] w-[60px] items-center justify-center rounded-full">
        <Icon size={25} color={colors.primary} strokeWidth={2} />
      </View>

      <Text
        className={cn(
          'text-fg mb-2 text-center',
          compact ? 'text-lg tracking-[-0.36px]' : 'text-[23px] tracking-[-0.46px]',
        )}
        style={{ fontFamily: displayFontFamily(theme.name) }}
      >
        {title}
      </Text>

      {subtitle ? (
        <Text
          className={cn(
            'text-muted max-w-[230px] text-center text-[12.5px] leading-5',
            showCta ? 'mb-5.5' : null,
          )}
        >
          {subtitle}
        </Text>
      ) : null}

      {showCta ? (
        <Pressable
          onPress={onCtaPress}
          accessibilityRole="button"
          accessibilityLabel={ctaLabel}
          className="bg-primary h-11 flex-row items-center gap-2 rounded-full px-4.5"
        >
          {CtaIcon ? <CtaIcon size={18} color={colors.onPrimary} strokeWidth={2} /> : null}
          <Text className="text-on-primary text-sm font-semibold tracking-[-0.14px]">{ctaLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
