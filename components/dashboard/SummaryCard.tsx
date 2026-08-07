import { TrendingDown, TrendingUp } from 'lucide-react-native';
import { Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';

import { DisplayAmount, formatDisplayNumber } from '@/components/ui/DisplayAmount';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Typography } from '@/constants/theme';
import { cn } from '@/lib/utils';
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
  const { colors, elevation } = theme;
  const prev =
    previousAmount ??
    (deltaPct !== undefined ? previousFromDelta(amount, deltaPct ?? null) : null);
  const showChip = deltaPct !== null && deltaPct !== undefined;
  const isPositive = showChip && deltaPct! >= 0;

  return (
    <View
      className="border-card-bd bg-surface mb-2.5 rounded-xl border px-4.5 pt-5 pb-4.5"
      style={[elevation.card, style]}
    >
      <Text className="text-muted mb-2.75 text-[11px] font-semibold uppercase tracking-[1.54px]">
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

      <View className="mt-3.5 flex-row flex-wrap items-center gap-2.25">
        {showChip ? (
          <View
            className={cn(
              'flex-row items-center gap-1.5 rounded-full px-2.75 py-1.25',
              isPositive ? 'bg-pos-tint' : 'bg-neg-tint'
            )}
          >
            {isPositive ? (
              <TrendingUp size={12} color={colors.pos} strokeWidth={2} />
            ) : (
              <TrendingDown size={12} color={colors.neg} strokeWidth={2} />
            )}
            <Text
              className={cn(
                'text-[11px] font-semibold tracking-[-0.055px]',
                isPositive ? 'text-pos' : 'text-neg'
              )}
            >
              {formatDeltaPct(deltaPct!)}
            </Text>
          </View>
        ) : (
          <Text className="text-muted text-[11.5px]">{t('dashboard.noComparison')}</Text>
        )}
        {prev !== null ? (
          <Text className="text-muted text-[10px] font-semibold uppercase tracking-[0.8px]">
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
  const { elevation } = theme;

  return (
    <View
      className="border-card-bd bg-surface mb-4 flex-row overflow-hidden rounded-xl border"
      style={[elevation.card, style]}
    >
      <Bay
        label={incomeLabel}
        amount={incomeAmount}
        deltaPct={incomeDeltaPct}
        currency={currency}
        language={language}
      />
      <View className="bg-bd w-px self-stretch" />
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
  const hasDelta = deltaPct !== null && deltaPct !== undefined;
  const isGood = hasDelta
    ? invertDelta
      ? deltaPct! < 0
      : deltaPct! > 0
    : false;
  const deltaClassName = !hasDelta
    ? 'text-muted'
    : deltaPct === 0
      ? 'text-muted'
      : isGood
        ? 'text-pos'
        : 'text-neg';

  return (
    <View className="flex-1 px-4 pt-4 pb-3.75">
      <Text className="text-muted mb-2.25 text-[10px] font-semibold uppercase tracking-[0.8px]">
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
        <Text className={cn('mt-1.75 text-xs font-semibold', deltaClassName)}>
          {formatDeltaPct(deltaPct!)}
        </Text>
      ) : null}
    </View>
  );
}
