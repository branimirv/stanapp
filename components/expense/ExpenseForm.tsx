import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { CategoryChipPicker } from '@/components/expense/CategoryChipPicker';
import { AppBottomSheet } from '@/components/ui/AppBottomSheet';
import { AppButton } from '@/components/ui/AppButton';
import { AppDatePicker } from '@/components/ui/AppDatePicker';
import { AppPicker } from '@/components/ui/AppPicker';
import { AppSegmentedControl } from '@/components/ui/AppSegmentedControl';
import { useStackChromeEdgeInset } from '@/components/ui/StackScreenChrome';
import { AppTextInput } from '@/components/ui/AppTextInput';
import { Spacing, Typography } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { displayFontFamily, Fonts } from '@/lib/fonts';
import type { ExpenseCategory, ExpenseType, Property } from '@/types/app.types';
import {
  defaultRecurringForType,
  filterCategoriesByType,
  getCategoryEffectiveType,
} from '@/utils/expense';
import { parseDateString, toDateString, translateFieldError } from '@/utils/formHelpers';
import { expenseSchema, type ExpenseFormValues } from '@/utils/validators';

export interface ExpenseFormProps {
  title?: string;
  defaultValues?: Partial<ExpenseFormValues>;
  properties: Property[];
  categories: ExpenseCategory[];
  onCreateCustomCategory?: (name: string) => Promise<ExpenseCategory>;
  isSubmitting?: boolean;
  submitLabel?: string;
  onSubmit: (values: ExpenseFormValues) => void | Promise<void>;
  /** Host BlurOverlay sibling — fire when any picker/date/custom sheet opens or closes. */
  onSheetVisibilityChange?: (open: boolean) => void;
}

const defaultFormValues: ExpenseFormValues = {
  property_id: '',
  category_id: '',
  amount: 0,
  is_recurring: true,
  billing_date: toDateString(new Date()) ?? '',
  due_date: null,
  notes: null,
};

function FieldLab({ label }: { label: string }) {
  const { theme } = useAppTheme();
  return (
    <Text
      style={{
        fontFamily: Fonts.sans.semibold,
        fontSize: Typography.text.fieldLabel.size,
        lineHeight: 17,
        color: theme.colors.fg,
        marginBottom: 8,
      }}
    >
      {label}
    </Text>
  );
}

export function ExpenseForm({
  title,
  defaultValues,
  properties,
  categories,
  onCreateCustomCategory,
  isSubmitting = false,
  submitLabel,
  onSubmit,
  onSheetVisibilityChange,
}: ExpenseFormProps) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const { colors } = theme;
  const insets = useSafeAreaInsets();
  const edgeInset = useStackChromeEdgeInset();

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
      if (category) return getCategoryEffectiveType(category);
    }
    return 'regular';
  }, [categories, defaultValues?.category_id]);

  const [expenseType, setExpenseType] = useState<ExpenseType>(initialType);
  const [customCategoryVisible, setCustomCategoryVisible] = useState(false);
  const [customCategoryName, setCustomCategoryName] = useState('');
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [customCategoryError, setCustomCategoryError] = useState<string | null>(null);

  const selectedCategoryId = watch('category_id');

  const filteredCategories = useMemo(
    () => filterCategoriesByType(categories, expenseType),
    [categories, expenseType],
  );

  const handleExpenseTypeChange = (type: ExpenseType) => {
    setExpenseType(type);
    setValue('is_recurring', defaultRecurringForType(type));

    const currentCategory = categories.find((c) => c.id === selectedCategoryId);
    if (currentCategory && getCategoryEffectiveType(currentCategory) !== type) {
      setValue('category_id', '');
    }
  };

  useEffect(() => {
    if (defaultValues?.category_id) {
      const category = categories.find((c) => c.id === defaultValues.category_id);
      if (category) {
        setExpenseType(getCategoryEffectiveType(category));
      }
    }
  }, [categories, defaultValues?.category_id]);

  const propertyOptions = properties.map((property) => ({
    label: property.name,
    value: property.id,
  }));

  const translateError = (message?: string) => translateFieldError(t, message);

  const openCustomCategory = () => {
    setCustomCategoryName('');
    setCustomCategoryError(null);
    setCustomCategoryVisible(true);
    onSheetVisibilityChange?.(true);
  };

  const dismissCustomCategory = () => {
    setCustomCategoryVisible(false);
    onSheetVisibilityChange?.(false);
  };

  const handleAddCustomCategory = async () => {
    if (!onCreateCustomCategory || isCreatingCategory) return;

    const normalizedName = customCategoryName.trim();
    if (!normalizedName) {
      setCustomCategoryError(t('validation.required'));
      return;
    }

    const alreadyExists = categories.some(
      (category) =>
        getCategoryEffectiveType(category) === 'irregular' &&
        (category.name ?? category.key).trim().toLowerCase() === normalizedName.toLowerCase(),
    );
    if (alreadyExists) {
      setCustomCategoryError(t('expenses.customCategoryExists'));
      return;
    }

    setIsCreatingCategory(true);
    setCustomCategoryError(null);
    try {
      const createdCategory = await onCreateCustomCategory(normalizedName);
      setValue('category_id', createdCategory.id, { shouldValidate: true });
      setCustomCategoryName('');
      dismissCustomCategory();
    } catch (error) {
      setCustomCategoryError(
        error instanceof Error ? error.message : t('expenses.customCategoryCreateFailed'),
      );
    } finally {
      setIsCreatingCategory(false);
    }
  };

  return (
    <View style={styles.shell}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingHorizontal: theme.spacing.gutter,
            paddingTop: (edgeInset ?? 0) + 8,
            paddingBottom: 24,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {title ? (
          <Text
            style={{
              fontFamily: displayFontFamily(theme.name),
              fontSize: 32,
              lineHeight: 32,
              letterSpacing: -0.8,
              color: colors.fg,
              marginBottom: 22,
            }}
            accessibilityRole="header"
          >
            {title}
          </Text>
        ) : null}

        <View style={styles.field}>
          <FieldLab label={t('expenses.expenseType')} />
          <AppSegmentedControl
            variant="picker"
            segments={[
              { label: t('expenses.typeRegular'), value: 'regular' },
              { label: t('expenses.typeIrregular'), value: 'irregular' },
            ]}
            value={expenseType}
            onValueChange={(value) => handleExpenseTypeChange(value as ExpenseType)}
          />
          <Text
            style={{
              fontFamily: Fonts.sans.regular,
              fontSize: 11.5,
              lineHeight: 17,
              color: colors.muted,
              marginTop: 8,
            }}
          >
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
              style={styles.field}
              onVisibilityChange={onSheetVisibilityChange}
            />
          )}
        />

        <Controller
          control={control}
          name="category_id"
          render={({ field: { value, onChange }, fieldState }) => (
            <View style={styles.field}>
              <CategoryChipPicker
                label={t('expenses.category')}
                categories={filteredCategories}
                value={value || null}
                onValueChange={onChange}
                onAddCustom={
                  expenseType === 'irregular' && onCreateCustomCategory
                    ? openCustomCategory
                    : undefined
                }
                error={translateError(fieldState.error?.message)}
              />
            </View>
          )}
        />

        <Controller
          control={control}
          name="amount"
          render={({ field: { value, onChange, onBlur }, fieldState }) => (
            <AppTextInput
              label={t('expenses.amount')}
              value={value ? String(value) : ''}
              onChangeText={(text) => {
                const parsed = Number.parseFloat(text.replace(',', '.'));
                onChange(Number.isNaN(parsed) ? 0 : parsed);
              }}
              onBlur={onBlur}
              keyboardType="decimal-pad"
              error={translateError(fieldState.error?.message)}
              containerStyle={styles.inputGap}
              className="pl-[52px]"
              left={
                <Text
                  style={{
                    fontFamily: Fonts.sans.medium,
                    fontSize: 14,
                    color: colors.muted,
                  }}
                >
                  EUR
                </Text>
              }
            />
          )}
        />

        <Controller
          control={control}
          name="billing_date"
          render={({ field: { value, onChange }, fieldState }) => (
            <AppDatePicker
              label={t('expenses.billingDate')}
              value={parseDateString(value)}
              onChange={(date) => onChange(toDateString(date))}
              error={translateError(fieldState.error?.message)}
              style={styles.field}
              onVisibilityChange={onSheetVisibilityChange}
            />
          )}
        />

        <Controller
          control={control}
          name="due_date"
          render={({ field: { value, onChange }, fieldState }) => (
            <AppDatePicker
              label={t('expenses.dueDate')}
              value={parseDateString(value)}
              onChange={(date) => onChange(date ? toDateString(date) : null)}
              error={translateError(fieldState.error?.message)}
              style={styles.field}
              onVisibilityChange={onSheetVisibilityChange}
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
          containerStyle={[styles.inputGap, { marginBottom: 0 }]}
        />
      </ScrollView>

      <View
        style={[
          styles.formFoot,
          {
            paddingBottom: Math.max(insets.bottom, 14) + 8,
            backgroundColor: colors.bg,
          },
        ]}
      >
        <AppButton
          mode="contained"
          loading={isSubmitting}
          onPress={handleSubmit(onSubmit)}
          className="h-11 w-full"
          accessibilityLabel={submitLabel ?? t('dashboard.addExpense')}
        >
          {submitLabel ?? t('dashboard.addExpense')}
        </AppButton>
      </View>

      <AppBottomSheet
        visible={customCategoryVisible}
        onDismiss={dismissCustomCategory}
        title={t('expenses.addCustomCategory')}
      >
        <AppTextInput
          label={t('expenses.customCategoryName')}
          placeholder={t('expenses.customCategoryPlaceholder')}
          value={customCategoryName}
          onChangeText={(next) => {
            setCustomCategoryName(next);
            if (customCategoryError) setCustomCategoryError(null);
          }}
          error={customCategoryError ?? undefined}
          autoFocus
          containerStyle={{ marginBottom: 16 }}
        />
        <AppButton
          mode="contained"
          onPress={handleAddCustomCategory}
          loading={isCreatingCategory}
          className="h-11 w-full"
        >
          {t('common.add')}
        </AppButton>
      </AppBottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  field: {
    marginBottom: 18,
  },
  inputGap: {
    marginBottom: 18,
  },
  formFoot: {
    paddingHorizontal: Spacing.gutter,
    paddingTop: 14,
  },
});
