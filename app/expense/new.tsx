import { parseISO } from 'date-fns';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ExpenseForm } from '@/components/expense/ExpenseForm';
import { APP_BOTTOM_SHEET_CLOSE_MS } from '@/components/ui/AppBottomSheet';
import { BlurOverlay } from '@/components/ui/BlurOverlay';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { StackScreenChrome } from '@/components/ui/StackScreenChrome';
import { useExpenseCategories } from '@/hooks/useExpenseCategories';
import { useExpenseMutations } from '@/hooks/useExpenses';
import { useProperties } from '@/hooks/useProperties';
import { scheduleExpenseDueReminder } from '@/lib/notifications';
import { useUiStore } from '@/stores/uiStore';
import { getCategoryLabel } from '@/utils/expense';
import { toDateString } from '@/utils/formHelpers';
import type { ExpenseFormValues } from '@/utils/validators';

export default function NewExpenseScreen() {
  const { propertyId, categoryId, amount, notes, billingDate } = useLocalSearchParams<{
    propertyId?: string;
    categoryId?: string;
    amount?: string;
    notes?: string;
    billingDate?: string;
  }>();
  const { t } = useTranslation();
  const { properties, isLoading: propertiesLoading } = useProperties();
  const { categories, isLoading: categoriesLoading, createCustomCategory } = useExpenseCategories();
  const { create } = useExpenseMutations();
  const showToast = useUiStore((s) => s.showToast);
  const [isSaving, setIsSaving] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  const lockedProperty = useMemo(
    () => (propertyId ? properties.find((property) => property.id === propertyId) : undefined),
    [properties, propertyId],
  );

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
          `${category ? getCategoryLabel(category, t) : t('expenses.expense')} — ${expense.amount}`,
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
      <StackScreenChrome title={t('expenses.newExpense')} hideHeaderTitle edgeToEdge>
        <SkeletonLoader count={6} className="p-4" />
      </StackScreenChrome>
    );
  }

  return (
    <StackScreenChrome title={t('expenses.newExpense')} hideHeaderTitle edgeToEdge>
      <View className="flex-1 bg-transparent">
        <ExpenseForm
          key={propertyId ? `property-${propertyId}` : 'global'}
          title={t('expenses.newExpense')}
          properties={properties}
          categories={categories}
          defaultValues={{
            property_id: propertyId ?? lockedProperty?.id ?? '',
            category_id: categoryId ?? '',
            amount: amount ? Number.parseFloat(amount) : 0,
            billing_date: billingDate ?? toDateString(new Date()) ?? '',
            notes: notes ?? null,
          }}
          onSubmit={handleSubmit}
          onCreateCustomCategory={createCustomCategory}
          isSubmitting={isSaving}
          submitLabel={t('dashboard.addExpense')}
          onSheetVisibilityChange={setSheetOpen}
        />
        {/* Blur sibling of form — never inside the Modal (see docs/blur). */}
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
