import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Switch, Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { AppButton } from '@/components/ui/AppButton';
import { AppDatePicker } from '@/components/ui/AppDatePicker';
import { AppPicker } from '@/components/ui/AppPicker';
import { AppTextInput } from '@/components/ui/AppTextInput';
import { CategoryBadge } from '@/components/expense/CategoryBadge';
import { Spacing, Typography } from '@/constants/theme';
import type { ExpenseCategory, Property } from '@/types/app.types';
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
    formState: { errors },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema as never),
    defaultValues: { ...defaultFormValues, ...defaultValues },
  });

  const selectedCategoryId = watch('category_id');
  const selectedCategory = categories.find((category) => category.id === selectedCategoryId);

  const propertyOptions = properties.map((property) => ({
    label: property.name,
    value: property.id,
  }));

  const categoryOptions = categories.map((category) => ({
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
