import { TrendingDown, TrendingUp } from 'lucide-react-native';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';

import { DisplayAmount, formatDisplayNumber } from '@/components/ui/DisplayAmount';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Typography } from '@/constants/theme';
import { Fonts } from '@/lib/fonts';
import type { Language } from '@/types/app.types';

function formatDeltaPct(delta: number): string {
  const sign = delta > 0 ? '+' : delta < 0 ? '−' : '';
  return `${sign}${Math.abs(delta).toFixed(1).replace('.', ',')} %`;
}

/** Reverse previous value from current + delta% when API only exposes the pct. */
export function previousFromDelta(current: number, deltaPct: number | null): number | null {
  if (deltaPct === null) return null;
  const denom = 1 + deltaPct / 100;
  if (denom === 0) return null;
  return current / denom;
}

export interface NetIncomeCardProps {
  title: string;
  amount: number;
  currency: string;
  language?: Language;
  deltaPct?: number | null;
  previousAmount?: number | null;
  style?: StyleProp<ViewStyle>;
}

export function NetIncomeCard({
  title,
  amount,
  currency,
  language = 'hr',
  deltaPct,
  previousAmount,
  style,
}: NetIncomeCardProps) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const { colors } = theme;
  const prev =
    previousAmount ??
    (deltaPct !== undefined ? previousFromDelta(amount, deltaPct ?? null) : null);
  const showChip = deltaPct !== null && deltaPct !== undefined;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.cardBd,
          borderRadius: theme.radius.xl,
          ...theme.elevation.card,
        },
        style,
      ]}
    >
      <Text
        style={{
          fontFamily: Fonts.sans.semibold,
          fontSize: 11,
          letterSpacing: 1.54,
          textTransform: 'uppercase',
          color: colors.muted,
          marginBottom: 11,
        }}
      >
        {title}
      </Text>

      <DisplayAmount
        amount={amount}
        currency={currency}
        language={language}
        size={Typography.display.hero.size}
        lineHeight={Typography.display.hero.lineHeight}
        letterSpacing={Typography.display.hero.letterSpacing}
      />

      <View style={styles.deltaRow}>
        {showChip ? (
          <View
            style={[
              styles.chip,
              {
                backgroundColor: deltaPct! >= 0 ? colors.posTint : colors.negTint,
              },
            ]}
          >
            {deltaPct! >= 0 ? (
              <TrendingUp size={12} color={colors.pos} strokeWidth={2} />
            ) : (
              <TrendingDown size={12} color={colors.neg} strokeWidth={2} />
            )}
            <Text
              style={{
                fontFamily: Fonts.sans.semibold,
                fontSize: 11,
                letterSpacing: -0.055,
                color: deltaPct! >= 0 ? colors.pos : colors.neg,
              }}
            >
              {formatDeltaPct(deltaPct!)}
            </Text>
          </View>
        ) : (
          <Text
            style={{
              fontFamily: Fonts.sans.regular,
              fontSize: 11.5,
              color: colors.muted,
            }}
          >
            {t('dashboard.noComparison')}
          </Text>
        )}
        {prev !== null ? (
          <Text
            style={{
              fontFamily: Fonts.sans.semibold,
              fontSize: 10,
              letterSpacing: 0.8,
              textTransform: 'uppercase',
              color: colors.muted,
            }}
          >
            {t('dashboard.previousMonthShort', {
              amount: `${formatDisplayNumber(prev, language)} ${currency === 'EUR' ? '€' : currency}`,
            })}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

export interface IncomeExpenseBaysProps {
  incomeLabel: string;
  incomeAmount: number;
  incomeDeltaPct?: number | null;
  expenseLabel: string;
  expenseAmount: number;
  expenseDeltaPct?: number | null;
  currency: string;
  language?: Language;
  style?: StyleProp<ViewStyle>;
}

export function IncomeExpenseBays({
  incomeLabel,
  incomeAmount,
  incomeDeltaPct,
  expenseLabel,
  expenseAmount,
  expenseDeltaPct,
  currency,
  language = 'hr',
  style,
}: IncomeExpenseBaysProps) {
  const { theme } = useAppTheme();
  const { colors } = theme;

  return (
    <View
      style={[
        styles.bays,
        {
          backgroundColor: colors.surface,
          borderColor: colors.cardBd,
          borderRadius: theme.radius.xl,
          ...theme.elevation.card,
        },
        style,
      ]}
    >
      <Bay
        label={incomeLabel}
        amount={incomeAmount}
        deltaPct={incomeDeltaPct}
        currency={currency}
        language={language}
      />
      <View style={[styles.bayDivider, { backgroundColor: colors.bd }]} />
      <Bay
        label={expenseLabel}
        amount={expenseAmount}
        deltaPct={expenseDeltaPct}
        currency={currency}
        language={language}
        invertDelta
      />
    </View>
  );
}

function Bay({
  label,
  amount,
  deltaPct,
  currency,
  language,
  invertDelta,
}: {
  label: string;
  amount: number;
  deltaPct?: number | null;
  currency: string;
  language: Language;
  invertDelta?: boolean;
}) {
  const { theme } = useAppTheme();
  const { colors } = theme;
  const hasDelta = deltaPct !== null && deltaPct !== undefined;
  const isGood = hasDelta
    ? invertDelta
      ? deltaPct! < 0
      : deltaPct! > 0
    : false;
  const deltaColor = !hasDelta
    ? colors.muted
    : deltaPct === 0
      ? colors.muted
      : isGood
        ? colors.pos
        : colors.neg;

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
        }}
      >
        {label}
      </Text>
      <DisplayAmount
        amount={amount}
        currency={currency}
        language={language}
        size={Typography.display.amountSm.size}
        lineHeight={Typography.display.amountSm.lineHeight}
        letterSpacing={Typography.display.amountSm.letterSpacing}
      />
      {hasDelta ? (
        <Text
          style={{
            fontFamily: Fonts.sans.semibold,
            fontSize: 12,
            marginTop: 7,
            color: deltaColor,
          }}
        >
          {formatDeltaPct(deltaPct!)}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingTop: 20,
    paddingHorizontal: 18,
    paddingBottom: 18,
    marginBottom: 10,
    borderWidth: 1,
  },
  deltaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginTop: 14,
    flexWrap: 'wrap',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 5,
    paddingHorizontal: 11,
    borderRadius: 999,
  },
  bays: {
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
  },
  bay: {
    flex: 1,
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 15,
  },
  bayDivider: {
    width: StyleSheet.hairlineWidth > 0 ? 1 : 1,
    alignSelf: 'stretch',
  },
});
