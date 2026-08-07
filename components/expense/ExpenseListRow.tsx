import { Building2, CircleAlert, CircleCheck, Repeat } from 'lucide-react-native';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { formatDisplayNumber } from '@/components/ui/DisplayAmount';
import { Typography } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { displayFontFamily, Fonts } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import type { Expense, ExpenseCategory, Language } from '@/types/app.types';
import { getCategoryLabel } from '@/utils/expense';

export interface ExpenseListRowProps {
  expense: Expense;
  category?: ExpenseCategory | null;
  propertyName?: string;
  currency?: string;
  language?: Language;
  showDivider?: boolean;
  onPress?: (expenseId: string) => void;
}

/**
 * Naslov `.xrow` — status well + title/note/property + Fraunces amount.
 */
function ExpenseListRowComponent({
  expense,
  category,
  propertyName,
  currency = 'EUR',
  language = 'hr',
  showDivider = false,
  onPress,
}: ExpenseListRowProps) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const { colors } = theme;
  const isPaid = Boolean(expense.paid_at);
  const title =
    getCategoryLabel(category, t) || expense.notes?.trim() || t('expenses.expense');
  const note =
    category && expense.notes?.trim() && expense.notes.trim() !== title
      ? expense.notes.trim()
      : null;
  const curSym = currency === 'EUR' ? '€' : currency;
  const StatusIcon = isPaid ? CircleCheck : CircleAlert;

  return (
    <Pressable
      onPress={onPress ? () => onPress(expense.id) : undefined}
      disabled={!onPress}
      className={cn('flex-row items-center gap-3.25 py-3.5', showDivider && 'border-bd border-t')}
      style={showDivider ? { borderTopWidth: StyleSheet.hairlineWidth } : undefined}
      accessibilityRole={onPress ? 'button' : undefined}
    >
      <View
        className={cn(
          'relative h-9 w-9 items-center justify-center rounded-full',
          isPaid ? 'bg-pos-tint' : 'bg-neg-tint',
        )}
      >
        <StatusIcon size={16} color={isPaid ? colors.pos : colors.neg} strokeWidth={2} />
        {expense.is_recurring ? (
          <View className="border-bd bg-surface absolute -right-0.5 -bottom-0.5 h-3.75 w-3.75 items-center justify-center rounded-full border">
            <Repeat size={8} color={colors.muted} strokeWidth={2.75} />
          </View>
        ) : null}
      </View>

      <View className="min-w-0 flex-1">
        <Text className="text-fg text-base font-semibold" numberOfLines={1}>
          {title}
        </Text>
        {note ? (
          <Text className="text-muted mt-0.75 text-sm" numberOfLines={1}>
            {note}
          </Text>
        ) : null}
        {propertyName ? (
          <View className="mt-0.75 flex-row items-center gap-1.25">
            <Building2 size={12} color={colors.muted} strokeWidth={2} />
            <Text className="text-muted flex-1 text-sm" numberOfLines={1}>
              {propertyName}
            </Text>
          </View>
        ) : null}
      </View>

      <Text
        className="text-fg"
        style={{
          fontFamily: displayFontFamily(theme.name),
          fontSize: Typography.display.listFigure.size,
          letterSpacing: Typography.display.listFigure.letterSpacing,
          fontVariant: ['tabular-nums', 'lining-nums'],
        }}
      >
        {formatDisplayNumber(Number(expense.amount), language)}
        <Text
          className="text-muted"
          style={{
            fontFamily: Fonts.sans.medium,
            fontSize: Typography.text.chip.size,
          }}
        >
          {curSym}
        </Text>
      </Text>
    </Pressable>
  );
}

export const ExpenseListRow = memo(ExpenseListRowComponent);
