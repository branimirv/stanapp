import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ErrorState } from '@/components/ui/ErrorState';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { ExpenseForm } from '@/components/expense/ExpenseForm';
import { useThemedScreenStyles } from '@/hooks/useThemedScreenStyles';
import { useExpenseCategories } from '@/hooks/useExpenseCategories';
import { useExpenses } from '@/hooks/useExpenses';
import { useProperties } from '@/hooks/useProperties';
import {
  cancelExpenseReminders,
  scheduleExpenseDueReminder,
} from '@/lib/notifications';
import { supabase } from '@/lib/supabase';
import { useUiStore } from '@/stores/uiStore';
import type { Expense } from '@/types/app.types';
import type { ExpenseFormValues } from '@/utils/validators';
import { parseISO } from 'date-fns';

export default function EditExpenseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { properties } = useProperties();
  const { categories } = useExpenseCategories();
  const { update } = useExpenses();
  const showToast = useUiStore((s) => s.showToast);

  const [expense, setExpense] = useState<Expense | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const screenStyles = useThemedScreenStyles();

  const loadExpense = useCallback(async () => {
    if (!id) return;

    setIsLoading(true);
    setError(null);

    const { data, error: err } = await supabase.from('expenses').select('*').eq('id', id).single();

    if (err) {
      setError(err.message);
      setExpense(null);
    } else {
      setExpense(data);
    }

    setIsLoading(false);
  }, [id]);

  useEffect(() => {
    loadExpense();
  }, [loadExpense]);

  const handleSubmit = async (values: ExpenseFormValues) => {
    if (!id) return;

    setIsSaving(true);
    try {
      const updated = await update(id, {
        property_id: values.property_id,
        category_id: values.category_id,
        amount: values.amount,
        is_recurring: values.is_recurring,
        billing_date: values.billing_date,
        due_date: values.due_date ?? null,
        notes: values.notes ?? null,
      });

      await cancelExpenseReminders(updated.id);
      if (updated.due_date && !updated.paid_at) {
        const category = categories.find((c) => c.id === updated.category_id);
        await scheduleExpenseDueReminder(
          updated.id,
          parseISO(updated.due_date),
          t('expenses.dueSoon'),
          `${category ? t(`categories.${category.key}`) : t('expenses.expense')} — ${updated.amount}`,
        );
      }

      showToast({ message: t('expenses.saveSuccess'), type: 'success' });
      router.back();
    } catch (err) {
      showToast({
        message: err instanceof Error ? err.message : t('expenses.saveFailed'),
        type: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ title: t('expenses.editExpense') }} />
        <SkeletonLoader count={6} style={styles.loader} />
      </>
    );
  }

  if (error || !expense) {
    return (
      <>
        <Stack.Screen options={{ title: t('expenses.editExpense') }} />
        <ErrorState message={error ?? t('expenses.notFound')} onRetry={loadExpense} />
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: t('expenses.editExpense') }} />
      <View style={[screenStyles.container, styles.container]}>
        <ExpenseForm
          properties={properties}
          categories={categories}
          defaultValues={{
            property_id: expense.property_id,
            category_id: expense.category_id,
            amount: expense.amount,
            is_recurring: expense.is_recurring,
            billing_date: expense.billing_date,
            due_date: expense.due_date,
            notes: expense.notes,
          }}
          onSubmit={handleSubmit}
          isSubmitting={isSaving}
          submitLabel={t('common.update')}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 8,
  },
  loader: {
    padding: 16,
  },
});
