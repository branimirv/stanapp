import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Text } from '@/components/ui/text';
import { Colors } from '@/constants/theme';
import { cn } from '@/lib/utils';
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
      key: 'expenses',
      label: t('properties.statsExpenses'),
      value: formatCurrency(totalExpenses, currency, resolvedLanguage),
      color: Colors.danger,
    },
    {
      key: 'net',
      label: t('properties.statsNet'),
      value: formatCurrency(net, currency, resolvedLanguage),
      color: net >= 0 ? Colors.accent : Colors.danger,
    },
  ] as const;

  return (
    <View className="gap-1">
      {periodLabel ? <Text className="text-muted-foreground text-xs">{periodLabel}</Text> : null}
      <View className="bg-card border-border flex-row overflow-hidden rounded-xl border">
        {stats.map((stat, index) => (
          <View
            key={stat.key}
            className={cn(
              'flex-1 items-center justify-center px-2 py-4',
              index < stats.length - 1 && 'border-border border-r',
            )}
          >
            <Text className="text-muted-foreground mb-1 text-center text-xs font-medium">
              {stat.label}
            </Text>
            <Text className="text-center text-base font-medium" style={{ color: stat.color }} numberOfLines={1}>
              {stat.value}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
