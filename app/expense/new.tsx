import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { ExpenseForm } from '@/components/expense/ExpenseForm';
import { useThemedScreenStyles } from '@/hooks/useThemedScreenStyles';
import { useExpenseCategories } from '@/hooks/useExpenseCategories';
import { useExpenses } from '@/hooks/useExpenses';
import { useProperties } from '@/hooks/useProperties';
import { scheduleExpenseDueReminder } from '@/lib/notifications';
import { useUiStore } from '@/stores/uiStore';
import type { ExpenseFormValues } from '@/utils/validators';
import { parseISO } from 'date-fns';

export default function NewExpenseScreen() {
  const { propertyId } = useLocalSearchParams<{ propertyId?: string }>();
  const { t } = useTranslation();
  const { properties, isLoading: propertiesLoading } = useProperties();
  const { categories, isLoading: categoriesLoading } = useExpenseCategories();
  const { create } = useExpenses();
  const showToast = useUiStore((s) => s.showToast);
  const [isSaving, setIsSaving] = useState(false);
  const screenStyles = useThemedScreenStyles();

  const handleSubmit = async (values: ExpenseFormValues) => {
    setIsSaving(true);
    try {
      const expense = await create({
        property_id: values.property_id,
        category_id: values.category_id,
        amount: values.amount,
        is_recurring: values.is_recurring,
        billing_date: values.billing_date,
        due_date: values.due_date ?? null,
        notes: values.notes ?? null,
      });

      if (expense.due_date && !expense.paid_at) {
        const category = categories.find((c) => c.id === expense.category_id);
        await scheduleExpenseDueReminder(
          expense.id,
          parseISO(expense.due_date),
          t('expenses.dueSoon'),
          `${category ? t(`categories.${category.key}`) : t('expenses.expense')} — ${expense.amount}`,
        );
      }

      showToast({ message: t('expenses.saveSuccess'), type: 'success' });
      router.replace(`/expense/${expense.id}`);
    } catch (err) {
      showToast({
        message: err instanceof Error ? err.message : t('expenses.saveFailed'),
        type: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (propertiesLoading || categoriesLoading) {
    return (
      <>
        <Stack.Screen options={{ title: t('expenses.newExpense') }} />
        <SkeletonLoader count={6} style={styles.loader} />
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: t('expenses.newExpense') }} />
      <View style={[screenStyles.container, styles.container]}>
        <ExpenseForm
          properties={properties}
          categories={categories}
          defaultValues={{
            property_id: propertyId ?? '',
            billing_date: new Date().toISOString().slice(0, 10),
          }}
          onSubmit={handleSubmit}
          isSubmitting={isSaving}
          submitLabel={t('common.create')}
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
