import { Calendar, CheckCircle, Trash2 } from 'lucide-react-native';
import { useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Card, Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { AppBadge } from '@/components/ui/AppBadge';
import { CategoryBadge } from '@/components/expense/CategoryBadge';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { formatCurrency, formatDate, isOverdue } from '@/utils/formatters';
import type { Expense, ExpenseCategory, Language } from '@/types/app.types';

export interface ExpenseCardProps {
  expense: Expense;
  category?: ExpenseCategory | null;
  propertyName?: string;
  currency?: string;
  language?: Language;
  onPress?: () => void;
  onMarkPaid?: (expenseId: string) => void;
  onDelete?: () => void;
}

export function ExpenseCard({
  expense,
  category,
  propertyName,
  currency = 'EUR',
  language = 'hr',
  onPress,
  onMarkPaid,
  onDelete,
}: ExpenseCardProps) {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const swipeableRef = useRef<Swipeable>(null);
  const resolvedLanguage = language ?? (i18n.language === 'en' ? 'en' : 'hr');
  const isPaid = Boolean(expense.paid_at);
  const overdue = !isPaid && isOverdue(expense.due_date, expense.paid_at);

  const renderRightActions = () => (
    <View style={styles.actions}>
      {!isPaid && onMarkPaid ? (
        <Pressable
          style={[styles.action, styles.paidAction]}
          onPress={() => {
            swipeableRef.current?.close();
            onMarkPaid(expense.id);
          }}
          accessibilityRole="button"
          accessibilityLabel={t('expenses.markPaid')}
        >
          <CheckCircle size={20} color={Colors.textInverse} strokeWidth={2} />
          <Text style={styles.actionLabel}>{t('expenses.markPaid')}</Text>
        </Pressable>
      ) : null}
      {onDelete ? (
        <Pressable
          style={[styles.action, styles.deleteAction]}
          onPress={() => {
            swipeableRef.current?.close();
            onDelete();
          }}
          accessibilityRole="button"
          accessibilityLabel={t('common.delete')}
        >
          <Trash2 size={20} color={Colors.textInverse} strokeWidth={2} />
          <Text style={styles.actionLabel}>{t('common.delete')}</Text>
        </Pressable>
      ) : null}
    </View>
  );

  const card = (
    <Pressable onPress={onPress} disabled={!onPress}>
      <Card
        mode="elevated"
        style={[
          styles.card,
          { backgroundColor: theme.dark ? Colors.surfaceDark : Colors.surface },
        ]}
      >
        <Card.Content style={styles.content}>
          <View style={styles.header}>
            {category ? (
              <CategoryBadge
                categoryKey={category.key}
                icon={category.icon}
                color={category.color}
              />
            ) : null}
            <View style={styles.badges}>
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
            <Text style={[styles.propertyName, { color: theme.colors.onSurfaceVariant }]}>
              {propertyName}
            </Text>
          ) : null}

          <Text style={[styles.amount, { color: theme.colors.onSurface }]}>
            {formatCurrency(Number(expense.amount), expense.currency ?? currency, resolvedLanguage)}
          </Text>

          {expense.due_date ? (
            <View style={styles.dateRow}>
              <Calendar size={14} color={theme.colors.onSurfaceVariant} strokeWidth={2} />
              <Text style={[styles.dateText, { color: theme.colors.onSurfaceVariant }]}>
                {t('expenses.dueDate')}: {formatDate(expense.due_date, resolvedLanguage)}
              </Text>
            </View>
          ) : null}

          {expense.notes ? (
            <Text
              style={[styles.notes, { color: theme.colors.onSurfaceVariant }]}
              numberOfLines={2}
            >
              {expense.notes}
            </Text>
          ) : null}
        </Card.Content>
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

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    marginBottom: Spacing.sm,
  },
  content: {
    gap: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: Spacing.xs,
    flex: 1,
  },
  propertyName: {
    ...Typography.bodyMedium,
  },
  amount: {
    ...Typography.headlineMedium,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  dateText: {
    ...Typography.bodySmall,
  },
  notes: {
    ...Typography.bodySmall,
  },
  actions: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
  },
  action: {
    width: 88,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    borderRadius: 12,
    marginLeft: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  paidAction: {
    backgroundColor: Colors.accent,
  },
  deleteAction: {
    backgroundColor: Colors.danger,
  },
  actionLabel: {
    ...Typography.labelSmall,
    color: Colors.textInverse,
    textAlign: 'center',
  },
});
