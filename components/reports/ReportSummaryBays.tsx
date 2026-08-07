import { StyleSheet, Text, View } from 'react-native';

import { DisplayAmount } from '@/components/ui/DisplayAmount';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { Language } from '@/types/app.types';

type ReportSummaryBaysProps = {
  incomeLabel: string;
  expenseLabel: string;
  netLabel: string;
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  currency: string;
  language: Language;
};

/** Income / expense / net amount bays on the Analitika report. */
export function ReportSummaryBays({
  incomeLabel,
  expenseLabel,
  netLabel,
  totalIncome,
  totalExpenses,
  netIncome,
  currency,
  language,
}: ReportSummaryBaysProps) {
  const { theme } = useAppTheme();
  const { colors, elevation } = theme;
  const displayCurrency = currency === 'EUR' ? '€' : currency;

  const bays = [
    { label: incomeLabel, amount: totalIncome, color: colors.fg },
    { label: expenseLabel, amount: totalExpenses, color: colors.fg },
    { label: netLabel, amount: netIncome, color: colors.primary },
  ] as const;

  return (
    <View
      className="border-card-bd bg-surface mb-5 flex-row overflow-hidden rounded-xl border"
      style={[{ borderWidth: StyleSheet.hairlineWidth }, elevation.card]}
    >
      {bays.map((bay, index) => (
        <View key={bay.label} className="flex-1 flex-row">
          {index > 0 ? (
            <View className="bg-bd" style={{ width: StyleSheet.hairlineWidth }} />
          ) : null}
          <View className="flex-1 px-3 py-4">
            <Text className="text-muted mb-2.25 text-[10px] font-semibold tracking-[0.8px] uppercase">
              {bay.label}
            </Text>
            <DisplayAmount
              amount={bay.amount}
              currency={displayCurrency}
              language={language}
              size={19}
              lineHeight={19}
              letterSpacing={-0.38}
              color={bay.color}
            />
          </View>
        </View>
      ))}
    </View>
  );
}
