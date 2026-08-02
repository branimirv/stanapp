import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Text } from '@/components/ui/text';
import { Colors } from '@/constants/theme';
import { formatCurrency } from '@/utils/formatters';
import type { Language } from '@/types/app.types';

export interface PropertyStatsProps {
  totalIncome: number;
  totalExpenses: number;
  currency?: string;
  language?: Language;
  periodLabel?: string;
}

export function PropertyStats({
  totalIncome,
  totalExpenses,
  currency = 'EUR',
  language = 'hr',
  periodLabel,
}: PropertyStatsProps) {
  const { t, i18n } = useTranslation();
  const resolvedLanguage = language ?? (i18n.language === 'en' ? 'en' : 'hr');
  const net = totalIncome - totalExpenses;

  const stats = [
    {
      key: 'income',
      label: t('properties.statsIncome'),
      value: formatCurrency(totalIncome, currency, resolvedLanguage),
      color: Colors.accent,
    },
    {
      key: 'net',
      label: t('properties.statsNet'),
      value: formatCurrency(net, currency, resolvedLanguage),
      color: net >= 0 ? Colors.accent : Colors.danger,
    },
  ] as const;

  return (
    <View className="gap-2.5">
      {periodLabel ? (
        <Text className="text-muted-foreground text-xs font-medium">{periodLabel}</Text>
      ) : null}
      <View className="flex-row gap-2.5">
        {stats.map((stat) => (
          <View
            key={stat.key}
            className="bg-muted/60 min-w-0 flex-1 gap-1.5 rounded-3xl px-3 py-4"
          >
            <Text
              className="text-muted-foreground text-[10px] font-semibold tracking-wide uppercase"
              numberOfLines={1}
            >
              {stat.label}
            </Text>
            <Text
              className="text-lg font-bold"
              style={{ color: stat.color }}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {stat.value}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
