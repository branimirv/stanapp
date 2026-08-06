import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { formatDisplayNumber } from '@/components/ui/DisplayAmount';
import { useAppTheme } from '@/hooks/useAppTheme';
import { displayFontFamily, Fonts } from '@/lib/fonts';
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
  const { colors, elevation, radius } = theme;
  const resolvedLanguage = language ?? (i18n.language === 'en' ? 'en' : 'hr');
  const net = totalIncome - totalExpenses;
  const curSym = currency === 'EUR' ? '€' : currency;

  return (
    <View
      style={[
        styles.bays,
        {
          backgroundColor: colors.surface,
          borderColor: colors.cardBd,
          borderRadius: radius.xl,
          ...elevation.card,
        },
      ]}
    >
      <Bay
        label={t('properties.statsExpenseBay')}
        amount={totalExpenses}
        currencySuffix={curSym}
        language={resolvedLanguage}
      />
      <View style={[styles.divider, { backgroundColor: colors.bd }]} />
      <Bay label={t('properties.statsTenantsBay')} value={tenantCount} />
      <View style={[styles.divider, { backgroundColor: colors.bd }]} />
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
  const { colors } = theme;

  return (
    <View style={styles.bay}>
      <Text
        style={{
          fontFamily: Fonts.sans.semibold,
          fontSize: 10,
          letterSpacing: 0.8,
          textTransform: 'uppercase',
          color: colors.muted,
          marginBottom: 9,
          textAlign: 'center',
        }}
        numberOfLines={1}
      >
        {label}
      </Text>
      {amount != null ? (
        <Text
          style={{
            fontFamily: displayFontFamily(theme.name),
            fontSize: 20,
            letterSpacing: -0.5,
            color: colors.fg,
            textAlign: 'center',
            fontVariant: ['tabular-nums', 'lining-nums'],
          }}
          numberOfLines={1}
        >
          {formatDisplayNumber(amount, language)}
          {currencySuffix ? (
            <Text
              style={{
                fontFamily: Fonts.sans.medium,
                fontSize: 12,
                color: colors.muted,
              }}
            >
              {currencySuffix}
            </Text>
          ) : null}
        </Text>
      ) : (
        <Text
          style={{
            fontFamily: displayFontFamily(theme.name),
            fontSize: 20,
            letterSpacing: -0.5,
            color: colors.fg,
            textAlign: 'center',
            fontVariant: ['tabular-nums', 'lining-nums'],
          }}
        >
          {value ?? 0}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bays: {
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    marginBottom: 18,
  },
  bay: {
    flex: 1,
    paddingTop: 16,
    paddingHorizontal: 11,
    paddingBottom: 15,
    alignItems: 'center',
  },
  divider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
  },
});
