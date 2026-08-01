import { Calendar, CheckCircle, Trash2 } from 'lucide-react-native';
import { memo, useRef } from 'react';
import { Pressable, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useTranslation } from 'react-i18next';

import { AppBadge } from '@/components/ui/AppBadge';
import { CategoryBadge } from '@/components/expense/CategoryBadge';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { Colors } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { formatCurrency, formatDate, isOverdue } from '@/utils/formatters';
import type { Expense, ExpenseCategory, Language } from '@/types/app.types';

export interface ExpenseCardProps {
  expense: Expense;
  category?: ExpenseCategory | null;
  propertyName?: string;
  currency?: string;
  language?: Language;
  onPress?: (expenseId: string) => void;
  onMarkPaid?: (expenseId: string) => void;
  onDelete?: (expenseId: string) => void;
}

function ExpenseCardComponent({
  expense,
  category,
  propertyName,
  currency = 'EUR',
  language = 'hr',
  onPress,
  onMarkPaid,
  onDelete,
}: ExpenseCardProps) {
  const { isDark } = useAppTheme();
  const { t, i18n } = useTranslation();
  const swipeableRef = useRef<Swipeable>(null);
  const resolvedLanguage = language ?? (i18n.language === 'en' ? 'en' : 'hr');
  const isPaid = Boolean(expense.paid_at);
  const overdue = !isPaid && isOverdue(expense.due_date, expense.paid_at);
  const handlePress = onPress ? () => onPress(expense.id) : undefined;

  const renderRightActions = () => (
    <View className="mb-2 flex-row">
      {!isPaid && onMarkPaid ? (
        <Pressable
          className="ml-1 w-22 items-center justify-center gap-1 rounded-xl px-2"
          style={{ backgroundColor: Colors.accent }}
          onPress={() => {
            swipeableRef.current?.close();
            onMarkPaid(expense.id);
          }}
          accessibilityRole="button"
          accessibilityLabel={t('expenses.markPaid')}
        >
          <CheckCircle size={20} color={Colors.textInverse} strokeWidth={2} />
          <Text
            className="text-center text-[11px] font-medium"
            style={{ color: Colors.textInverse }}
          >
            {t('expenses.markPaid')}
          </Text>
        </Pressable>
      ) : null}
      {onDelete ? (
        <Pressable
          className="ml-1 w-22 items-center justify-center gap-1 rounded-xl px-2"
          style={{ backgroundColor: Colors.danger }}
          onPress={() => {
            swipeableRef.current?.close();
            onDelete(expense.id);
          }}
          accessibilityRole="button"
          accessibilityLabel={t('common.delete')}
        >
          <Trash2 size={20} color={Colors.textInverse} strokeWidth={2} />
          <Text
            className="text-center text-[11px] font-medium"
            style={{ color: Colors.textInverse }}
          >
            {t('common.delete')}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );

  const card = (
    <Pressable onPress={handlePress} disabled={!handlePress}>
      <Card
        className="mb-2 gap-2 rounded-xl p-4"
        style={{ backgroundColor: isDark ? Colors.surfaceDark : Colors.surface }}
      >
        <View className="flex-row items-start justify-between gap-2">
          {category ? (
            <CategoryBadge
              categoryKey={category.key}
              categoryName={category.name}
              icon={category.icon}
              color={category.color}
            />
          ) : null}
          <View className="flex-1 flex-row flex-wrap justify-end gap-1">
            {category?.type === 'irregular' ? (
              <AppBadge label={t('expenses.typeIrregular')} variant="warning" />
            ) : category?.type === 'regular' ? (
              <AppBadge label={t('expenses.typeRegular')} variant="success" />
            ) : null}
            {expense.is_recurring ? (
              <AppBadge label={t('expenses.recurring')} variant="info" />
            ) : (
              <AppBadge label={t('expenses.oneTime')} variant="default" />
            )}
            {isPaid ? (
              <AppBadge label={t('expenses.paid')} variant="paid" />
            ) : overdue ? (
              <AppBadge label={t('expenses.overdue')} variant="error" />
            ) : (
              <AppBadge label={t('expenses.unpaid')} variant="pending" />
            )}
          </View>
        </View>

        {propertyName ? (
          <Text className="text-muted-foreground text-sm">{propertyName}</Text>
        ) : null}

        <Text className="text-2xl font-semibold">
          {formatCurrency(Number(expense.amount), expense.currency ?? currency, resolvedLanguage)}
        </Text>

        {expense.due_date ? (
          <View className="flex-row items-center gap-1">
            <Calendar size={14} className="text-muted-foreground" strokeWidth={2} />
            <Text className="text-muted-foreground text-xs">
              {t('expenses.dueDate')}: {formatDate(expense.due_date, resolvedLanguage)}
            </Text>
          </View>
        ) : null}

        {expense.notes ? (
          <Text className="text-muted-foreground text-xs" numberOfLines={2}>
            {expense.notes}
          </Text>
        ) : null}
      </Card>
    </Pressable>
  );

  if (!onMarkPaid && !onDelete) {
    return card;
  }

  return (
    <Swipeable ref={swipeableRef} renderRightActions={renderRightActions} overshootRight={false}>
      {card}
    </Swipeable>
  );
}

export const ExpenseCard = memo(ExpenseCardComponent);
