import { ChevronRight } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useAppTheme } from '@/hooks/useAppTheme';
import { displayFontFamily } from '@/lib/fonts';
import { cn } from '@/lib/utils';

export interface OccupancyCardProps {
  rentedCount: number;
  vacantCount: number;
  totalCount: number;
  onPress?: () => void;
}

/** Naslov occupancy — sechead + % · 3-bay strip (rented / vacant / total). */
export function OccupancyCard({
  rentedCount,
  vacantCount,
  totalCount,
  onPress,
}: OccupancyCardProps) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const { colors, elevation } = theme;

  const occupancyPct = totalCount > 0 ? Math.round((rentedCount / totalCount) * 100) : 0;

  return (
    <View className="mb-4">
      <Pressable
        onPress={onPress}
        disabled={!onPress}
        accessibilityRole={onPress ? 'button' : undefined}
      >
        <View className="mb-2.75 flex-row items-baseline gap-2">
          <Text
            className="text-fg flex-1 text-[22px] leading-6 tracking-[-0.55px]"
            style={{ fontFamily: displayFontFamily(theme.name) }}
          >
            {t('dashboard.occupancy')}
          </Text>
          <Text
            className="text-primary text-[18px] tracking-[-0.36px]"
            style={{ fontFamily: displayFontFamily(theme.name) }}
          >
            {occupancyPct} %
          </Text>
          {onPress ? (
            <View className="ml-1">
              <ChevronRight size={16} color={colors.muted} strokeWidth={2} />
            </View>
          ) : null}
        </View>
      </Pressable>

      <Pressable
        onPress={onPress}
        disabled={!onPress}
        className="border-card-bd bg-surface flex-row overflow-hidden rounded-xl border"
        style={elevation.card}
      >
        <Bay
          value={rentedCount}
          label={t('dashboard.rented')}
          valueClassName="text-pos"
        />
        <View className="bg-bd w-px self-stretch" />
        <Bay
          value={vacantCount}
          label={t('dashboard.vacant')}
          valueClassName={vacantCount > 0 ? 'text-chart-4' : 'text-fg'}
        />
        <View className="bg-bd w-px self-stretch" />
        <Bay value={totalCount} label={t('dashboard.total')} valueClassName="text-fg" />
      </Pressable>
    </View>
  );
}

function Bay({
  value,
  label,
  valueClassName,
}: {
  value: number;
  label: string;
  valueClassName: string;
}) {
  const { theme } = useAppTheme();

  return (
    <View className="flex-1 items-center px-3 pt-4 pb-3.75">
      <Text className="text-muted mb-2 text-[10px] font-semibold uppercase tracking-[0.8px]">
        {label}
      </Text>
      <Text
        className={cn('text-[23px] tracking-[-0.46px] tabular-nums', valueClassName)}
        style={{ fontFamily: displayFontFamily(theme.name) }}
      >
        {value}
      </Text>
    </View>
  );
}
