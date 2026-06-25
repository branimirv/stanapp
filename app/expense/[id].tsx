import { Image } from 'expo-image';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Divider, Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { AppBadge } from '@/components/ui/AppBadge';
import { AppButton } from '@/components/ui/AppButton';
import { ErrorState } from '@/components/ui/ErrorState';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { CategoryBadge } from '@/components/expense/CategoryBadge';
import { Spacing, Typography } from '@/constants/theme';
import { useExpenseCategories } from '@/hooks/useExpenseCategories';
import { useExpenses } from '@/hooks/useExpenses';
import { useProfile } from '@/hooks/useProfile';
import { cancelExpenseReminders } from '@/lib/notifications';
import { supabase } from '@/lib/supabase';
import { useUiStore } from '@/stores/uiStore';
import type { Expense, Property } from '@/types/app.types';
import { resolveCurrency } from '@/utils/currency';
import { formatCurrency, formatDate, isOverdue } from '@/utils/formatters';

export default function ExpenseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const showToast = useUiStore((s) => s.showToast);
  const showConfirmDialog = useUiStore((s) => s.showConfirmDialog);

  const [expense, setExpense] = useState<Expense | null>(null);
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { profile } = useProfile();
  const { categories } = useExpenseCategories();
  const { markAsPaid, remove } = useExpenses();

  const language = profile?.language ?? (i18n.language as 'en' | 'hr');
  const currency = resolveCurrency(profile, property, expense?.currency);
  const category = useMemo(
    () => categories.find((c) => c.id === expense?.category_id),
    [categories, expense?.category_id],
  );

  const loadExpense = useCallback(async () => {
    if (!id) return;

    setIsLoading(true);
    setError(null);

    const { data, error: err } = await supabase.from('expenses').select('*').eq('id', id).single();

    if (err) {
      setError(err.message);
      setExpense(null);
      setIsLoading(false);
      return;
    }

    setExpense(data);

    const { data: propertyData } = await supabase
      .from('properties')
      .select('*')
      .eq('id', data.property_id)
      .single();

    setProperty(propertyData ?? null);
    setIsLoading(false);
  }, [id]);

  useEffect(() => {
    loadExpense();
  }, [loadExpense]);

  const handleMarkPaid = () => {
    if (!expense) return;

    showConfirmDialog({
      title: t('confirm.markPaidTitle'),
      message: t('confirm.markPaidMessage'),
      confirmLabel: t('expenses.markPaid'),
      onConfirm: async () => {
        try {
          await markAsPaid(expense.id);
          await cancelExpenseReminders(expense.id);
          showToast({ message: t('expenses.markedPaid'), type: 'success' });
          await loadExpense();
        } catch (err) {
          showToast({
            message: err instanceof Error ? err.message : t('expenses.markPaidFailed'),
            type: 'error',
          });
        }
      },
    });
  };

  const handleDelete = () => {
    if (!expense) return;

    showConfirmDialog({
      title: t('confirm.deleteExpenseTitle'),
      message: t('confirm.deleteExpenseMessage'),
      confirmLabel: t('common.delete'),
      destructive: true,
      onConfirm: async () => {
        try {
          await cancelExpenseReminders(expense.id);
          await remove(expense.id);
          showToast({ message: t('expenses.deleteSuccess'), type: 'success' });
          router.back();
        } catch (err) {
          showToast({
            message: err instanceof Error ? err.message : t('expenses.deleteFailed'),
            type: 'error',
          });
        }
      },
    });
  };

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ title: t('expenses.expenseDetails') }} />
        <SkeletonLoader count={5} style={styles.loader} />
      </>
    );
  }

  if (error || !expense) {
    return (
      <>
        <Stack.Screen options={{ title: t('expenses.expenseDetails') }} />
        <ErrorState message={error ?? t('expenses.notFound')} onRetry={loadExpense} />
      </>
    );
  }

  const paid = Boolean(expense.paid_at);
  const overdue = isOverdue(expense.due_date, expense.paid_at);

  return (
    <>
      <Stack.Screen
        options={{
          title: t('expenses.expenseDetails'),
          headerRight: () => (
            <AppButton mode="text" onPress={() => router.push(`/expense/edit/${expense.id}`)}>
              {t('common.edit')}
            </AppButton>
          ),
        }}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          {category ? (
          <CategoryBadge
            categoryKey={category.key}
            icon={category.icon}
            color={category.color}
          />
        ) : null}
          {category?.type ? (
            <AppBadge
              label={
                category.type === 'regular'
                  ? t('expenses.typeRegular')
                  : t('expenses.typeIrregular')
              }
              variant={category.type === 'regular' ? 'success' : 'warning'}
            />
          ) : null}
          <AppBadge
            label={expense.is_recurring ? t('expenses.recurring') : t('expenses.oneTime')}
            variant="info"
          />
          <AppBadge
            label={paid ? t('expenses.paid') : overdue ? t('expenses.overdue') : t('expenses.unpaid')}
            variant={paid ? 'success' : overdue ? 'error' : 'warning'}
          />
        </View>

        <Text style={[styles.amount, { color: theme.colors.onSurface }]}>
          {formatCurrency(expense.amount, currency, language)}
        </Text>

        {property ? (
          <Text
            style={[styles.link, { color: theme.colors.primary }]}
            onPress={() => router.push(`/property/${property.id}`)}
          >
            {property.name}
          </Text>
        ) : null}

        <Divider style={styles.divider} />

        <Text style={[styles.row, { color: theme.colors.onSurfaceVariant }]}>
          {t('expenses.billingDate')}: {formatDate(expense.billing_date, language)}
        </Text>
        {expense.due_date ? (
          <Text style={[styles.row, { color: theme.colors.onSurfaceVariant }]}>
            {t('expenses.dueDate')}: {formatDate(expense.due_date, language)}
          </Text>
        ) : null}
        {expense.paid_at ? (
          <Text style={[styles.row, { color: theme.colors.onSurfaceVariant }]}>
            {t('expenses.paidAt')}: {formatDate(expense.paid_at.slice(0, 10), language)}
          </Text>
        ) : null}

        {expense.notes ? (
          <>
            <Text style={[styles.section, { color: theme.colors.onSurface }]}>
              {t('common.notes')}
            </Text>
            <Text style={{ color: theme.colors.onSurfaceVariant }}>{expense.notes}</Text>
          </>
        ) : null}

        {expense.receipt_photo_url ? (
          <>
            <Text style={[styles.section, { color: theme.colors.onSurface }]}>
              {t('expenses.receipt')}
            </Text>
            <Image
              source={{ uri: expense.receipt_photo_url }}
              style={styles.receipt}
              contentFit="cover"
            />
          </>
        ) : null}

        <View style={styles.actions}>
          {!paid ? (
            <AppButton mode="contained" onPress={handleMarkPaid}>
              {t('expenses.markPaid')}
            </AppButton>
          ) : null}
          <AppButton mode="outlined" textColor={theme.colors.error} onPress={handleDelete}>
            {t('common.delete')}
          </AppButton>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  loader: {
    padding: Spacing.md,
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
    gap: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  amount: {
    ...Typography.displayMedium,
  },
  link: {
    ...Typography.bodyMedium,
  },
  divider: {
    marginVertical: Spacing.sm,
  },
  row: {
    ...Typography.bodyMedium,
  },
  section: {
    ...Typography.titleMedium,
    marginTop: Spacing.sm,
  },
  receipt: {
    width: '100%',
    height: 220,
    borderRadius: 12,
  },
  actions: {
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
});
