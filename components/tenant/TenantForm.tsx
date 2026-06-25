import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { AppButton } from '@/components/ui/AppButton';
import { AppDatePicker } from '@/components/ui/AppDatePicker';
import { AppTextInput } from '@/components/ui/AppTextInput';
import { Spacing } from '@/constants/theme';
import { tenantSchema, type TenantFormValues } from '@/utils/validators';

export interface TenantFormProps {
  defaultValues?: Partial<TenantFormValues>;
  isSubmitting?: boolean;
  submitLabel?: string;
  onSubmit: (values: TenantFormValues) => void | Promise<void>;
}

const defaultFormValues: TenantFormValues = {
  first_name: '',
  last_name: '',
  email: '',
  phone: null,
  contract_start: '',
  contract_end: null,
  deposit_amount: 0,
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

export function TenantForm({
  defaultValues,
  isSubmitting = false,
  submitLabel,
  onSubmit,
}: TenantFormProps) {
  const theme = useTheme();
  const { t } = useTranslation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<TenantFormValues>({
    resolver: zodResolver(tenantSchema as never),
    defaultValues: { ...defaultFormValues, ...defaultValues },
  });

  const translateError = (message?: string) => (message ? t(message) : undefined);

  return (
    <ScrollView
      style={{ backgroundColor: theme.colors.background }}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <AppTextInput
        control={control}
        name="first_name"
        label={t('tenants.firstName')}
        autoCapitalize="words"
        error={translateError(errors.first_name?.message)}
      />

      <AppTextInput
        control={control}
        name="last_name"
        label={t('tenants.lastName')}
        autoCapitalize="words"
        error={translateError(errors.last_name?.message)}
      />

      <AppTextInput
        control={control}
        name="email"
        label={t('tenants.email')}
        keyboardType="email-address"
        autoCapitalize="none"
        error={translateError(errors.email?.message)}
      />

      <AppTextInput
        control={control}
        name="phone"
        label={t('tenants.phone')}
        keyboardType="phone-pad"
        error={translateError(errors.phone?.message)}
      />

      <Controller
        control={control}
        name="contract_start"
        render={({ field: { value, onChange }, fieldState }) => (
          <AppDatePicker
            label={t('tenants.contractStart')}
            value={parseDateValue(value)}
            onChange={(date) => onChange(formatDateValue(date))}
            error={translateError(fieldState.error?.message)}
          />
        )}
      />

      <Controller
        control={control}
        name="contract_end"
        render={({ field: { value, onChange }, fieldState }) => (
          <AppDatePicker
            label={t('tenants.contractEnd')}
            value={parseDateValue(value)}
            onChange={(date) => onChange(date ? formatDateValue(date) : null)}
            error={translateError(fieldState.error?.message)}
          />
        )}
      />

      <Controller
        control={control}
        name="deposit_amount"
        render={({ field: { value, onChange, onBlur }, fieldState }) => (
          <AppTextInput
            label={t('tenants.depositAmount')}
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

      <AppTextInput
        control={control}
        name="notes"
        label={t('tenants.notes')}
        placeholder={t('tenants.notesPlaceholder')}
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
  submit: {
    marginTop: Spacing.sm,
  },
});
