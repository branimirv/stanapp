import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppButton } from '@/components/ui/AppButton';
import { AppDatePicker } from '@/components/ui/AppDatePicker';
import { AppTextInput } from '@/components/ui/AppTextInput';
import { Text } from '@/components/ui/text';
import { CategoryBadge } from '@/components/expense/CategoryBadge';
import { cn } from '@/lib/utils';
import type { ExpenseCategory } from '@/types/app.types';
import {
  defaultRecurringForType,
  filterCategoriesByType,
  getCategoryEffectiveType,
} from '@/utils/expense';

export interface QuickAddExpenseValues {
  property_id: string;
  category_id: string;
  amount: number;
  is_recurring: boolean;
  billing_date: string;
  notes: string | null;
}

export interface QuickAddExpenseSheetProps {
  visible: boolean;
  onDismiss: () => void;
  propertyId: string;
  categories: ExpenseCategory[];
  onSubmit: (values: QuickAddExpenseValues) => Promise<void>;
  isSubmitting?: boolean;
}

function formatDateValue(date: Date | null): string {
  if (!date) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function QuickAddExpenseSheet({
  visible,
  onDismiss,
  propertyId,
  categories,
  onSubmit,
  isSubmitting = false,
}: QuickAddExpenseSheetProps) {
  const { t } = useTranslation();

  const regularCategories = useMemo(
    () => filterCategoriesByType(categories, 'regular'),
    [categories],
  );

  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [billingDate, setBillingDate] = useState<Date>(new Date());
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (visible) {
      setAmount('');
      setCategoryId(regularCategories[0]?.id ?? '');
      setBillingDate(new Date());
      setNotes('');
    }
  }, [visible, regularCategories]);

  const parsedAmount = Number.parseFloat(amount.replace(',', '.'));
  const isValid = categoryId && !Number.isNaN(parsedAmount) && parsedAmount > 0;

  const handleSave = async () => {
    if (!isValid) return;
    const category = categories.find((c) => c.id === categoryId);
    await onSubmit({
      property_id: propertyId,
      category_id: categoryId,
      amount: parsedAmount,
      is_recurring: category ? defaultRecurringForType(getCategoryEffectiveType(category)) : true,
      billing_date: formatDateValue(billingDate),
      notes: notes.trim() || null,
    });
    onDismiss();
  };

  const handleMoreDetails = () => {
    onDismiss();
    router.push({
      pathname: '/expense/new',
      params: {
        propertyId,
        ...(categoryId ? { categoryId } : {}),
        ...(amount ? { amount } : {}),
        ...(notes.trim() ? { notes: notes.trim() } : {}),
        billingDate: formatDateValue(billingDate),
      },
    });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onDismiss}>
      <Pressable className="flex-1 justify-end bg-black/45" onPress={onDismiss}>
        <Pressable
          className="bg-surface max-h-[85%] gap-2 rounded-t-2xl px-6 pt-2 pb-8"
          onPress={(event) => event.stopPropagation()}
        >
          <View className="bg-bd mb-2 h-1 w-9 self-center rounded-sm" />

          <Text className="text-fg mb-1 text-center text-lg font-medium">
            {t('expenses.quickAddTitle')}
          </Text>

          <AppTextInput
            label={t('expenses.amount')}
            placeholder={t('expenses.amountPlaceholder')}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            autoFocus
          />

          <Text className="text-muted mt-1 text-sm font-semibold">
            {t('expenses.category')}
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="flex-row gap-2 py-1"
          >
            {regularCategories.map((category) => {
              const selected = category.id === categoryId;
              return (
                <Pressable
                  key={category.id}
                  onPress={() => setCategoryId(category.id)}
                  className={cn(
                    'rounded-full border',
                    selected ? 'border-primary border-2' : 'border-transparent',
                  )}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                >
                  <CategoryBadge
                    categoryKey={category.key}
                    categoryName={category.name}
                    icon={category.icon}
                    color={category.color}
                  />
                </Pressable>
              );
            })}
          </ScrollView>

          <AppDatePicker
            label={t('expenses.billingDate')}
            value={billingDate}
            onChange={(date) => date && setBillingDate(date)}
          />

          <AppTextInput
            label={t('expenses.notes')}
            placeholder={t('expenses.notesPlaceholder')}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={2}
          />

          <View className="mt-4 flex-row items-center justify-between">
            <AppButton mode="text" onPress={handleMoreDetails}>
              {t('expenses.moreDetails')}
            </AppButton>
            <AppButton
              mode="contained"
              loading={isSubmitting}
              disabled={!isValid || isSubmitting}
              onPress={handleSave}
            >
              {t('common.save')}
            </AppButton>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
