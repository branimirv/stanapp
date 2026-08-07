import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { formatDisplayNumber } from '@/components/ui/DisplayAmount';
import { useAppTheme } from '@/hooks/useAppTheme';
import { displayFontFamily } from '@/lib/fonts';
import type { Language } from '@/types/app.types';

export interface PropertyStatsProps {
  totalIncome: number;
  totalExpenses: number;
  tenantCount: number;
  currency?: string;
  language?: Language;
}

/**
 * Naslov 3-bay strip — Trošak / Stanari / Saldo.
 */
export function PropertyStats({
  totalIncome,
  totalExpenses,
  tenantCount,
  currency = 'EUR',
  language = 'hr',
}: PropertyStatsProps) {
  const { t, i18n } = useTranslation();
  const { theme } = useAppTheme();
  const { elevation } = theme;
  const resolvedLanguage = language ?? (i18n.language === 'en' ? 'en' : 'hr');
  const net = totalIncome - totalExpenses;
  const curSym = currency === 'EUR' ? '€' : currency;

  return (
    <View
      className="border-card-bd bg-surface mb-4.5 flex-row overflow-hidden rounded-xl border"
      style={elevation.card}
    >
      <Bay
        label={t('properties.statsExpenseBay')}
        amount={totalExpenses}
        currencySuffix={curSym}
        language={resolvedLanguage}
      />
      <View className="bg-bd self-stretch" style={{ width: StyleSheet.hairlineWidth }} />
      <Bay label={t('properties.statsTenantsBay')} value={tenantCount} />
      <View className="bg-bd self-stretch" style={{ width: StyleSheet.hairlineWidth }} />
      <Bay
        label={t('properties.statsNet')}
        amount={net}
        currencySuffix={curSym}
        language={resolvedLanguage}
      />
    </View>
  );
}

function Bay({
  label,
  amount,
  value,
  currencySuffix,
  language = 'hr',
}: {
  label: string;
  amount?: number;
  value?: number;
  currencySuffix?: string;
  language?: Language;
}) {
  const { theme } = useAppTheme();

  return (
    <View className="flex-1 items-center px-2.75 pt-4 pb-3.75">
      <Text
        className="text-muted mb-2.25 text-center text-[10px] font-semibold tracking-[0.8px] uppercase"
        numberOfLines={1}
      >
        {label}
      </Text>
      {amount != null ? (
        <Text
          className="text-fg text-center text-xl tracking-[-0.5px]"
          style={{
            fontFamily: displayFontFamily(theme.name),
            fontVariant: ['tabular-nums', 'lining-nums'],
          }}
          numberOfLines={1}
        >
          {formatDisplayNumber(amount, language)}
          {currencySuffix ? (
            <Text className="text-muted text-xs font-medium">{currencySuffix}</Text>
          ) : null}
        </Text>
      ) : (
        <Text
          className="text-fg text-center text-xl tracking-[-0.5px]"
          style={{
            fontFamily: displayFontFamily(theme.name),
            fontVariant: ['tabular-nums', 'lining-nums'],
          }}
        >
          {value ?? 0}
        </Text>
      )}
    </View>
  );
}
