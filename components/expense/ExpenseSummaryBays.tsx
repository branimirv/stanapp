import { StyleSheet, Text, View } from 'react-native';

import { DisplayAmount } from '@/components/ui/DisplayAmount';
import { Typography } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { cn } from '@/lib/utils';
import type { Language } from '@/types/app.types';

type ExpenseSummaryBaysProps = {
  thisMonthLabel: string;
  thisMonthTotal: number;
  averageLabel: string;
  sixMonthAverage: number;
  currency: string;
  language: Language;
  className?: string;
};

/** This-month / 6-month-average amount bays above the Troškovi list. */
export function ExpenseSummaryBays({
  thisMonthLabel,
  thisMonthTotal,
  averageLabel,
  sixMonthAverage,
  currency,
  language,
  className,
}: ExpenseSummaryBaysProps) {
  const { theme } = useAppTheme();
  const { colors, elevation } = theme;

  return (
    <View
      className={cn(
        'border-card-bd bg-surface flex-row overflow-hidden rounded-xl border',
        className,
      )}
      style={[{ borderWidth: StyleSheet.hairlineWidth }, elevation.card]}
    >
      <View className="flex-1 px-4 pt-4 pb-3.75">
        <Text className="text-muted mb-2.25 text-[10px] font-semibold tracking-[0.8px] uppercase">
          {thisMonthLabel}
        </Text>
        <DisplayAmount
          amount={thisMonthTotal}
          currency={currency}
          language={language}
          size={Typography.display.amountSm.size}
          lineHeight={Typography.display.amountSm.lineHeight}
          letterSpacing={Typography.display.amountSm.letterSpacing}
        />
      </View>
      <View className="bg-bd w-px self-stretch" />
      <View className="flex-1 px-4 pt-4 pb-3.75">
        <Text className="text-muted mb-2.25 text-[10px] font-semibold tracking-[0.8px] uppercase">
          {averageLabel}
        </Text>
        <DisplayAmount
          amount={sixMonthAverage}
          currency={currency}
          language={language}
          size={Typography.display.amountSm.size}
          lineHeight={Typography.display.amountSm.lineHeight}
          letterSpacing={Typography.display.amountSm.letterSpacing}
          color={colors.muted}
        />
      </View>
    </View>
  );
}
