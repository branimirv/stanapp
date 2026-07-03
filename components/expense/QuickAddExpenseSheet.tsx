import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { AppButton } from '@/components/ui/AppButton';
import { AppDatePicker } from '@/components/ui/AppDatePicker';
import { AppTextInput } from '@/components/ui/AppTextInput';
import { CategoryBadge } from '@/components/expense/CategoryBadge';
import { Spacing, Typography } from '@/constants/theme';
import type { ExpenseCategory } from '@/types/app.types';
import { defaultRecurringForType, filterCategoriesByType } from '@/utils/expense';

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
  const theme = useTheme();
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
      is_recurring: category ? defaultRecurringForType(category.type) : true,
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
      <Pressable style={styles.overlay} onPress={onDismiss}>
        <Pressable
          style={[styles.content, { backgroundColor: theme.colors.surface }]}
          onPress={(event) => event.stopPropagation()}
        >
          <View style={[styles.handle, { backgroundColor: theme.colors.outlineVariant }]} />

          <Text style={[styles.title, { color: theme.colors.onSurface }]}>
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

          <Text style={[styles.sectionLabel, { color: theme.colors.onSurfaceVariant }]}>
            {t('expenses.category')}
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}
          >
            {regularCategories.map((category) => {
              const selected = category.id === categoryId;
              return (
                <Pressable
                  key={category.id}
                  onPress={() => setCategoryId(category.id)}
                  style={[
                    styles.chip,
                    selected && { borderColor: theme.colors.primary, borderWidth: 2 },
                  ]}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                >
                  <CategoryBadge
                    categoryKey={category.key}
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

          <View style={styles.actions}>
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

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  content: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    gap: Spacing.sm,
    maxHeight: '85%',
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    marginBottom: Spacing.sm,
  },
  title: {
    ...Typography.titleMedium,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  sectionLabel: {
    ...Typography.labelLarge,
    marginTop: Spacing.xs,
  },
  chipRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
  },
});
