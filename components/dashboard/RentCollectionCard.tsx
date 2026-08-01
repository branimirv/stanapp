import { ChevronRight, Home } from 'lucide-react-native';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Text } from '@/components/ui/text';
import { Colors } from '@/constants/theme';
import { formatCurrency } from '@/utils/formatters';
import type { Language } from '@/types/app.types';

export interface RentCollectionCardProps {
  collected: number;
  expected: number;
  currency: string;
  language?: Language;
  onPress?: () => void;
}

export function RentCollectionCard({
  collected,
  expected,
  currency,
  language = 'hr',
  onPress,
}: RentCollectionCardProps) {
  const { t } = useTranslation();

  const progress = expected > 0 ? Math.min(collected / expected, 1) : 0;
  const progressPct = Math.round(progress * 100);

  const content = (
    <View className="bg-card border-border mb-4 gap-2 rounded-xl border p-4">
      <View className="flex-row items-center gap-2">
        <View
          className="h-9 w-9 items-center justify-center rounded-full"
          style={{ backgroundColor: `${Colors.accent}22` }}
        >
          <Home size={20} color={Colors.accent} strokeWidth={2} />
        </View>
        <View className="flex-1 gap-0.5">
          <Text className="text-base font-medium">{t('dashboard.rentCollected')}</Text>
          <Text className="text-muted-foreground text-xs">
            {t('dashboard.rentCollectionProgress', { percent: progressPct })}
          </Text>
        </View>
        {onPress ? <ChevronRight size={20} className="text-muted-foreground" strokeWidth={2} /> : null}
      </View>

      <View className="bg-muted h-2 overflow-hidden rounded-full">
        <View
          className="h-full rounded-full"
          style={{
            width: `${progressPct}%`,
            backgroundColor: progressPct >= 100 ? Colors.accent : Colors.primary,
          }}
        />
      </View>

      <View className="flex-row items-baseline gap-1">
        <Text className="text-lg font-semibold">{formatCurrency(collected, currency, language)}</Text>
        <Text className="text-muted-foreground text-sm">
          / {formatCurrency(expected, currency, language)}
        </Text>
      </View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} accessibilityRole="button">
        {content}
      </Pressable>
    );
  }

  return content;
}
