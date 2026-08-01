import { Building2, ChevronRight } from 'lucide-react-native';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Text } from '@/components/ui/text';
import { Colors } from '@/constants/theme';

export interface OccupancyCardProps {
  rentedCount: number;
  vacantCount: number;
  totalCount: number;
  onPress?: () => void;
}

export function OccupancyCard({
  rentedCount,
  vacantCount,
  totalCount,
  onPress,
}: OccupancyCardProps) {
  const { t } = useTranslation();

  const occupancyPct = totalCount > 0 ? Math.round((rentedCount / totalCount) * 100) : 0;

  const content = (
    <View className="bg-card border-border gap-4 rounded-xl border p-4">
      <View className="flex-row items-center gap-2">
        <View
          className="h-9 w-9 items-center justify-center rounded-full"
          style={{ backgroundColor: `${Colors.primary}22` }}
        >
          <Building2 size={20} color={Colors.primary} strokeWidth={2} />
        </View>
        <View className="flex-1 gap-0.5">
          <Text className="text-base font-medium">{t('dashboard.occupancy')}</Text>
          <Text className="text-muted-foreground text-xs">
            {t('dashboard.occupancyRate', { percent: occupancyPct })}
          </Text>
        </View>
        {onPress ? <ChevronRight size={20} className="text-muted-foreground" strokeWidth={2} /> : null}
      </View>

      <View className="flex-row items-center justify-around">
        <View className="flex-1 items-center gap-0.5">
          <Text className="text-xl font-semibold" style={{ color: Colors.accent }}>
            {rentedCount}
          </Text>
          <Text className="text-muted-foreground text-[11px] font-medium">
            {t('dashboard.rented')}
          </Text>
        </View>
        <View className="bg-border h-8 w-px" />
        <View className="flex-1 items-center gap-0.5">
          <Text
            className="text-xl font-semibold"
            style={vacantCount > 0 ? { color: Colors.warning } : undefined}
          >
            {vacantCount}
          </Text>
          <Text className="text-muted-foreground text-[11px] font-medium">
            {t('dashboard.vacant')}
          </Text>
        </View>
        <View className="bg-border h-8 w-px" />
        <View className="flex-1 items-center gap-0.5">
          <Text className="text-xl font-semibold">{totalCount}</Text>
          <Text className="text-muted-foreground text-[11px] font-medium">
            {t('dashboard.total')}
          </Text>
        </View>
      </View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} accessibilityRole="button" className="mb-4">
        {content}
      </Pressable>
    );
  }

  return <View className="mb-4">{content}</View>;
}
