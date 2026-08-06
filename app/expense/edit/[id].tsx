import { parseISO } from 'date-fns';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ExpenseForm } from '@/components/expense/ExpenseForm';
import { APP_BOTTOM_SHEET_CLOSE_MS } from '@/components/ui/AppBottomSheet';
import { BlurOverlay } from '@/components/ui/BlurOverlay';
import { ErrorState } from '@/components/ui/ErrorState';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { StackScreenChrome } from '@/components/ui/StackScreenChrome';
import { useExpenseCategories } from '@/hooks/useExpenseCategories';
import { useExpense, useExpenseMutations } from '@/hooks/useExpenses';
import { useProperties } from '@/hooks/useProperties';
import {
  cancelExpenseReminders,
  scheduleExpenseDueReminder,
} from '@/lib/notifications';
import { useUiStore } from '@/stores/uiStore';
import { getCategoryLabel } from '@/utils/expense';
import type { ExpenseFormValues } from '@/utils/validators';

export default function EditExpenseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { properties } = useProperties();
  const { categories, createCustomCategory } = useExpenseCategories();
  const { update } = useExpenseMutations();
  const { expense, isLoading, error, refetch } = useExpense(id);
  const showToast = useUiStore((s) => s.showToast);

  const [isSaving, setIsSaving] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

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
          `${category ? getCategoryLabel(category, t) : t('expenses.expense')} — ${updated.amount}`,
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
      <StackScreenChrome title={t('expenses.editExpense')} hideHeaderTitle edgeToEdge>
        <SkeletonLoader count={6} style={styles.loader} />
      </StackScreenChrome>
    );
  }

  if (error || !expense) {
    return (
      <StackScreenChrome title={t('expenses.editExpense')} hideHeaderTitle edgeToEdge>
        <ErrorState message={error ?? t('expenses.notFound')} onRetry={refetch} />
      </StackScreenChrome>
    );
  }

  return (
    <StackScreenChrome title={t('expenses.editExpense')} hideHeaderTitle edgeToEdge>
      <View className="flex-1 bg-transparent">
        <ExpenseForm
          title={t('expenses.editExpense')}
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
          onCreateCustomCategory={createCustomCategory}
          isSubmitting={isSaving}
          submitLabel={t('common.update')}
          onSheetVisibilityChange={setSheetOpen}
        />
        <BlurOverlay
          visible={sheetOpen}
          intensity="strong"
          tint="dark"
          duration={APP_BOTTOM_SHEET_CLOSE_MS}
          zIndex={5}
        />
      </View>
    </StackScreenChrome>
  );
}

const styles = StyleSheet.create({
  loader: {
    padding: 16,
  },
});
