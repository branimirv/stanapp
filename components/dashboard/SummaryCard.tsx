import type { LucideIcon } from 'lucide-react-native';
import { Minus, TrendingDown, TrendingUp } from 'lucide-react-native';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Text } from '@/components/ui/text';
import { Colors } from '@/constants/theme';
import { cn } from '@/lib/utils';

export interface SummaryCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  accentColor?: string;
  delta?: number | null;
  invertDelta?: boolean;
  hero?: boolean;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

function formatDelta(delta: number): string {
  const rounded = Math.abs(delta).toFixed(0);
  return `${delta >= 0 ? '+' : '-'}${rounded}%`;
}

function DeltaBadge({
  delta,
  invertDelta,
}: {
  delta: number | null | undefined;
  invertDelta?: boolean;
}) {
  const { t } = useTranslation();

  if (delta === null || delta === undefined) {
    return (
      <View className="mt-0.5 flex-row items-center gap-1">
        <Minus size={12} color={Colors.textSecondary} strokeWidth={2} />
        <Text className="text-muted-foreground text-[11px] font-medium">
          {t('dashboard.noComparison')}
        </Text>
      </View>
    );
  }

  const isPositive = invertDelta ? delta < 0 : delta > 0;
  const isNeutral = delta === 0;
  const color = isNeutral ? Colors.textSecondary : isPositive ? Colors.accent : Colors.danger;
  const Icon = isNeutral ? Minus : delta > 0 ? TrendingUp : TrendingDown;

  return (
    <View className="mt-0.5 flex-row items-center gap-1">
      <Icon size={12} color={color} strokeWidth={2} />
      <Text className="text-[11px] font-medium" style={{ color }}>
        {formatDelta(delta)} {t('dashboard.vsLastMonth')}
      </Text>
    </View>
  );
}

export function SummaryCard({
  title,
  value,
  icon: Icon,
  accentColor = Colors.primary,
  delta,
  invertDelta,
  hero = false,
  style,
  className,
}: SummaryCardProps) {
  if (hero) {
    return (
      <View
        className={cn(
          'bg-card border-border mb-4 gap-2 rounded-2xl border p-6',
          className,
        )}
        style={style}
      >
        <View className="flex-row items-center gap-2">
          <View
            className="h-10 w-10 items-center justify-center rounded-full"
            style={{ backgroundColor: `${accentColor}22` }}
          >
            <Icon size={24} color={accentColor} strokeWidth={2} />
          </View>
          <Text className="text-muted-foreground text-base font-medium">{title}</Text>
        </View>
        <Text className="text-3xl font-bold" numberOfLines={1}>
          {value}
        </Text>
        <DeltaBadge delta={delta} invertDelta={invertDelta} />
      </View>
    );
  }

  return (
    <View
      className={cn('bg-card border-border min-w-25 flex-1 gap-2 rounded-2xl border p-4', className)}
      style={style}
    >
      <View
        className="h-10 w-10 items-center justify-center rounded-full"
        style={{ backgroundColor: `${accentColor}22` }}
      >
        <Icon size={22} color={accentColor} strokeWidth={2} />
      </View>
      <Text className="text-muted-foreground text-xs font-medium" numberOfLines={1}>
        {title}
      </Text>
      <Text className="text-lg font-semibold" numberOfLines={1}>
        {value}
      </Text>
      {delta !== undefined ? <DeltaBadge delta={delta} invertDelta={invertDelta} /> : null}
    </View>
  );
}
