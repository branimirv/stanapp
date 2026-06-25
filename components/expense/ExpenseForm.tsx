import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Switch, Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { AppButton } from '@/components/ui/AppButton';
import { AppDatePicker } from '@/components/ui/AppDatePicker';
import { AppPicker } from '@/components/ui/AppPicker';
import { AppSegmentedControl } from '@/components/ui/AppSegmentedControl';
import { AppTextInput } from '@/components/ui/AppTextInput';
import { CategoryBadge } from '@/components/expense/CategoryBadge';
import { Spacing, Typography } from '@/constants/theme';
import type { ExpenseCategory, ExpenseType, Property } from '@/types/app.types';
import { defaultRecurringForType, filterCategoriesByType } from '@/utils/expense';
import { expenseSchema, type ExpenseFormValues } from '@/utils/validators';

export interface ExpenseFormProps {
  defaultValues?: Partial<ExpenseFormValues>;
  properties: Property[];
  categories: ExpenseCategory[];
  isSubmitting?: boolean;
  submitLabel?: string;
  onSubmit: (values: ExpenseFormValues) => void | Promise<void>;
}

const defaultFormValues: ExpenseFormValues = {
  property_id: '',
  category_id: '',
  amount: 0,
  is_recurring: true,
  billing_date: '',
  due_date: null,
  notes: null,
};

function parseDateValue(value: string | null | undefined): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDateValue(date: Date | null): string {
  if (!date) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function ExpenseForm({
  defaultValues,
  properties,
  categories,
  isSubmitting = false,
  submitLabel,
  onSubmit,
}: ExpenseFormProps) {
  const theme = useTheme();
  const { t } = useTranslation();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema as never),
    defaultValues: { ...defaultFormValues, ...defaultValues },
  });

  const initialType = useMemo((): ExpenseType => {
    if (defaultValues?.category_id) {
      const category = categories.find((c) => c.id === defaultValues.category_id);
      if (category?.type) return category.type;
    }
    return 'regular';
  }, [categories, defaultValues?.category_id]);

  const [expenseType, setExpenseType] = useState<ExpenseType>(initialType);

  const selectedCategoryId = watch('category_id');
  const selectedCategory = categories.find((category) => category.id === selectedCategoryId);

  const filteredCategories = useMemo(
    () => filterCategoriesByType(categories, expenseType),
    [categories, expenseType],
  );

  const handleExpenseTypeChange = (type: ExpenseType) => {
    setExpenseType(type);
    setValue('is_recurring', defaultRecurringForType(type));

    const currentCategory = categories.find((c) => c.id === selectedCategoryId);
    if (currentCategory && currentCategory.type !== type) {
      setValue('category_id', '');
    }
  };

  useEffect(() => {
    if (defaultValues?.category_id) {
      const category = categories.find((c) => c.id === defaultValues.category_id);
      if (category?.type) {
        setExpenseType(category.type);
      }
    }
  }, [categories, defaultValues?.category_id]);

  const propertyOptions = properties.map((property) => ({
    label: property.name,
    value: property.id,
  }));

  const categoryOptions = filteredCategories.map((category) => ({
    label: t(`categories.${category.key}`),
    value: category.id,
  }));

  const translateError = (message?: string) => (message ? t(message) : undefined);

  return (
    <ScrollView
      style={{ backgroundColor: theme.colors.background }}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.typeField}>
        <Text style={[styles.typeLabel, { color: theme.colors.onSurface }]}>
          {t('expenses.expenseType')}
        </Text>
        <AppSegmentedControl
          segments={[
            { label: t('expenses.typeRegular'), value: 'regular' },
            { label: t('expenses.typeIrregular'), value: 'irregular' },
          ]}
          value={expenseType}
          onValueChange={(value) => handleExpenseTypeChange(value as ExpenseType)}
        />
        <Text style={[styles.typeHint, { color: theme.colors.onSurfaceVariant }]}>
          {expenseType === 'regular'
            ? t('expenses.typeRegularHint')
            : t('expenses.typeIrregularHint')}
        </Text>
      </View>

      <Controller
        control={control}
        name="property_id"
        render={({ field: { value, onChange }, fieldState }) => (
          <AppPicker
            label={t('expenses.property')}
            placeholder={t('expenses.selectProperty')}
            options={propertyOptions}
            value={value || null}
            onValueChange={onChange}
            error={translateError(fieldState.error?.message)}
          />
        )}
      />

      <Controller
        control={control}
        name="category_id"
        render={({ field: { value, onChange }, fieldState }) => (
          <View style={styles.categoryField}>
            <AppPicker
              label={t('expenses.category')}
              placeholder={t('expenses.selectCategory')}
              options={categoryOptions}
              value={value || null}
              onValueChange={onChange}
              error={translateError(fieldState.error?.message)}
            />
            {selectedCategory ? (
              <CategoryBadge
                categoryKey={selectedCategory.key}
                icon={selectedCategory.icon}
                color={selectedCategory.color}
                style={styles.categoryPreview}
              />
            ) : null}
          </View>
        )}
      />

      <Controller
        control={control}
        name="amount"
        render={({ field: { value, onChange, onBlur }, fieldState }) => (
          <AppTextInput
            label={t('expenses.amount')}
            placeholder={t('expenses.amountPlaceholder')}
            value={String(value ?? 0)}
            onChangeText={(text) => {
              const parsed = Number.parseFloat(text.replace(',', '.'));
              onChange(Number.isNaN(parsed) ? 0 : parsed);
            }}
            onBlur={onBlur}
            keyboardType="decimal-pad"
            error={translateError(fieldState.error?.message)}
          />
        )}
      />

      <Controller
        control={control}
        name="is_recurring"
        render={({ field: { value, onChange } }) => (
          <View style={styles.switchRow}>
            <View style={styles.switchText}>
              <Text style={[styles.switchLabel, { color: theme.colors.onSurface }]}>
                {t('expenses.isRecurring')}
              </Text>
              <Text style={[styles.switchHint, { color: theme.colors.onSurfaceVariant }]}>
                {t('expenses.isRecurringHint')}
              </Text>
            </View>
            <Switch value={value} onValueChange={onChange} />
          </View>
        )}
      />

      <Controller
        control={control}
        name="billing_date"
        render={({ field: { value, onChange }, fieldState }) => (
          <AppDatePicker
            label={t('expenses.billingDate')}
            value={parseDateValue(value)}
            onChange={(date) => onChange(formatDateValue(date))}
            error={translateError(fieldState.error?.message)}
          />
        )}
      />

      <Controller
        control={control}
        name="due_date"
        render={({ field: { value, onChange }, fieldState }) => (
          <AppDatePicker
            label={t('expenses.dueDate')}
            value={parseDateValue(value)}
            onChange={(date) => onChange(date ? formatDateValue(date) : null)}
            error={translateError(fieldState.error?.message)}
          />
        )}
      />

      <AppTextInput
        control={control}
        name="notes"
        label={t('expenses.notes')}
        placeholder={t('expenses.notesPlaceholder')}
        multiline
        numberOfLines={4}
        error={translateError(errors.notes?.message)}
      />

      <AppButton
        mode="contained"
        loading={isSubmitting}
        onPress={handleSubmit(onSubmit)}
        style={styles.submit}
      >
        {submitLabel ?? t('common.save')}
      </AppButton>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: Spacing.md,
    gap: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  typeField: {
    gap: Spacing.sm,
  },
  typeLabel: {
    ...Typography.titleMedium,
  },
  typeHint: {
    ...Typography.bodySmall,
  },
  categoryField: {
    gap: Spacing.sm,
  },
  categoryPreview: {
    alignSelf: 'flex-start',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  switchText: {
    flex: 1,
    gap: Spacing.xs,
  },
  switchLabel: {
    ...Typography.titleMedium,
  },
  switchHint: {
    ...Typography.bodySmall,
  },
  submit: {
    marginTop: Spacing.sm,
  },
});
