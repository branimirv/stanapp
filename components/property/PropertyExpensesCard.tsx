import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Text } from '@/components/ui/text';
import { Colors } from '@/constants/theme';
import { cn } from '@/lib/utils';
import type { Language } from '@/types/app.types';
import { formatCurrencyShort } from '@/utils/formatters';

export interface PropertyExpensesCardProps {
  total: number;
  currency: string;
  language: Language;
  expenseCount?: number;
  onPress: () => void;
  className?: string;
}

export function PropertyExpensesCard({
  total,
  currency,
  language,
  expenseCount = 0,
  onPress,
  className,
}: PropertyExpensesCardProps) {
  const { t } = useTranslation();

  return (
    <Pressable
      className={cn(
        'bg-muted/60 min-h-[140px] flex-1 items-center justify-between rounded-[28px] px-3 py-4',
        className,
      )}
      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${t('properties.statsExpenses')}: ${formatCurrencyShort(total, currency, language)}`}
    >
      <Text
        className="text-muted-foreground text-center text-[10px] font-semibold tracking-wide uppercase"
        numberOfLines={1}
      >
        {t('properties.statsExpenses')}
      </Text>

      <View className="items-center justify-center py-2">
        <Text
          className="text-center text-[22px] leading-7 font-bold"
          style={{ color: Colors.danger }}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {formatCurrencyShort(total, currency, language)}
        </Text>
      </View>

      {expenseCount > 0 ? (
        <Text
          className="text-muted-foreground text-center text-[11px] font-medium"
          numberOfLines={1}
        >
          {t('properties.expenseCount', { count: expenseCount })}
        </Text>
      ) : (
        <View className="h-4" />
      )}
    </Pressable>
  );
}
