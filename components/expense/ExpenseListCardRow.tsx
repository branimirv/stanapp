import { StyleSheet, View } from 'react-native';

import { ExpenseListRow } from '@/components/expense/ExpenseListRow';
import { useAppTheme } from '@/hooks/useAppTheme';
import { cn } from '@/lib/utils';
import type { Expense, ExpenseCategory, Language } from '@/types/app.types';

type ExpenseListCardRowProps = {
  expense: Expense;
  category?: ExpenseCategory | null;
  propertyName?: string;
  currency: string;
  language: Language;
  index: number;
  total: number;
  onPress: (expenseId: string) => void;
};

/** One virtualized row inside the shared Troškovi surface card chrome. */
export function ExpenseListCardRow({
  expense,
  category,
  propertyName,
  currency,
  language,
  index,
  total,
  onPress,
}: ExpenseListCardRowProps) {
  const { theme } = useAppTheme();
  const { elevation } = theme;
  const isFirst = index === 0;
  const isLast = index === total - 1;

  return (
    <View
      className={cn(
        'border-card-bd bg-surface px-4.5',
        isFirst && 'rounded-t-xl border-t border-x pt-1',
        !isFirst && !isLast && 'border-x',
        isLast && 'rounded-b-xl border-b border-x pb-1.5',
        isFirst && isLast && 'rounded-xl border pt-1 pb-1.5',
      )}
      style={[
        {
          borderLeftWidth: StyleSheet.hairlineWidth,
          borderRightWidth: StyleSheet.hairlineWidth,
          ...(isFirst
            ? { borderTopWidth: StyleSheet.hairlineWidth }
            : { borderTopWidth: 0 }),
          ...(isLast
            ? { borderBottomWidth: StyleSheet.hairlineWidth }
            : { borderBottomWidth: 0 }),
        },
        isFirst ? elevation.card : null,
      ]}
    >
      <ExpenseListRow
        expense={expense}
        category={category}
        propertyName={propertyName}
        currency={currency}
        language={language}
        showDivider={!isFirst}
        onPress={onPress}
      />
    </View>
  );
}
