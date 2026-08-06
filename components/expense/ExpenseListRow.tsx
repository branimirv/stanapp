import { Building2, CircleAlert, CircleCheck, Repeat } from 'lucide-react-native';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { formatDisplayNumber } from '@/components/ui/DisplayAmount';
import { Typography } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { displayFontFamily, Fonts } from '@/lib/fonts';
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
      style={[
        styles.row,
        showDivider ? { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.bd } : null,
      ]}
      accessibilityRole={onPress ? 'button' : undefined}
    >
      <View
        style={[
          styles.well,
          { backgroundColor: isPaid ? colors.posTint : colors.negTint },
        ]}
      >
        <StatusIcon
          size={16}
          color={isPaid ? colors.pos : colors.neg}
          strokeWidth={2}
        />
        {expense.is_recurring ? (
          <View
            style={[
              styles.recurring,
              {
                backgroundColor: colors.surface,
                borderColor: colors.bd,
              },
            ]}
          >
            <Repeat size={8} color={colors.muted} strokeWidth={2.75} />
          </View>
        ) : null}
      </View>

      <View style={styles.body}>
        <Text
          style={{
            fontFamily: Fonts.sans.semibold,
            fontSize: Typography.text.listRow.size,
            color: colors.fg,
          }}
          numberOfLines={1}
        >
          {title}
        </Text>
        {note ? (
          <Text
            style={{
              fontFamily: Fonts.sans.regular,
              fontSize: Typography.text.caption.size,
              color: colors.muted,
              marginTop: 3,
            }}
            numberOfLines={1}
          >
            {note}
          </Text>
        ) : null}
        {propertyName ? (
          <View style={styles.propertyRow}>
            <Building2 size={12} color={colors.muted} strokeWidth={2} />
            <Text
              style={{
                flex: 1,
                fontFamily: Fonts.sans.regular,
                fontSize: Typography.text.caption.size,
                color: colors.muted,
              }}
              numberOfLines={1}
            >
              {propertyName}
            </Text>
          </View>
        ) : null}
      </View>

      <Text
        style={{
          fontFamily: displayFontFamily(theme.name),
          fontSize: Typography.display.listFigure.size,
          letterSpacing: Typography.display.listFigure.letterSpacing,
          color: colors.fg,
          fontVariant: ['tabular-nums', 'lining-nums'],
        }}
      >
        {formatDisplayNumber(Number(expense.amount), language)}
        <Text
          style={{
            fontFamily: Fonts.sans.medium,
            fontSize: Typography.text.chip.size,
            color: colors.muted,
          }}
        >
          {curSym}
        </Text>
      </Text>
    </Pressable>
  );
}

export const ExpenseListRow = memo(ExpenseListRowComponent);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    paddingVertical: 14,
  },
  well: {
    width: 36,
    height: 36,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  recurring: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 15,
    height: 15,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  body: {
    flex: 1,
    minWidth: 0,
  },
  propertyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 3,
  },
});
