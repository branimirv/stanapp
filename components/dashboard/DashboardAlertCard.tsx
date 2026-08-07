import {
  ChevronRight,
  CircleAlert,
  Clock,
  FileText,
  type LucideIcon,
} from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { displayFontFamily } from '@/lib/fonts';
import { cn } from '@/lib/utils';

export type DashboardAlertTone = 'neg' | 'warn' | 'primary';

export interface DashboardAlertCardProps {
  title: string;
  subtitle: string;
  tone?: DashboardAlertTone;
  icon?: LucideIcon;
  onPress?: () => void;
}

const DEFAULT_ICONS: Record<DashboardAlertTone, LucideIcon> = {
  neg: CircleAlert,
  warn: Clock,
  primary: FileText,
};

/** Naslov alert row — tinted icon well, Fraunces title, lab-sm subtitle, chevron. */
export function DashboardAlertCard({
  title,
  subtitle,
  tone = 'neg',
  icon,
  onPress,
}: DashboardAlertCardProps) {
  const { theme } = useAppTheme();
  const { colors, elevation } = theme;
  const Icon = icon ?? DEFAULT_ICONS[tone];

  const accent =
    tone === 'neg' ? colors.neg : tone === 'warn' ? colors.chart[4] : colors.primary;

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      className="border-card-bd bg-surface mb-3 flex-row items-center gap-3.25 rounded-xl border px-4.5 py-3.75"
      style={elevation.card}
    >
      <View
        className={cn(
          'h-9.5 w-9.5 items-center justify-center rounded-full',
          tone === 'neg' && 'bg-neg-tint',
          tone === 'warn' && 'bg-chart-4-tint',
          tone === 'primary' && 'bg-primary-tint'
        )}
      >
        <Icon size={18} color={accent} strokeWidth={2} />
      </View>
      <View className="flex-1">
        <Text
          className={cn(
            'text-[17px] tracking-[-0.34px]',
            tone === 'neg' && 'text-neg',
            tone === 'warn' && 'text-chart-4',
            tone === 'primary' && 'text-primary'
          )}
          style={{ fontFamily: displayFontFamily(theme.name) }}
          numberOfLines={2}
        >
          {title}
        </Text>
        <Text
          className="text-muted mt-1 text-[10px] font-semibold uppercase tracking-[0.8px]"
          numberOfLines={2}
        >
          {subtitle}
        </Text>
      </View>
      {onPress ? <ChevronRight size={16} color={colors.muted} strokeWidth={2} /> : null}
    </Pressable>
  );
}

/** @deprecated Prefer DashboardAlertCard — kept as unpaid alias. */
export function DashboardUnpaidCard(props: Omit<DashboardAlertCardProps, 'tone' | 'icon'>) {
  return <DashboardAlertCard {...props} tone="neg" />;
}
