import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { AppDatePicker } from '@/components/ui/AppDatePicker';
import { AppFormScroll, AppFormSubmit } from '@/components/ui/AppFormScroll';
import { AppTextInput } from '@/components/ui/AppTextInput';
import { parseDateString, toDateString, translateFieldError } from '@/utils/formHelpers';
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
  phone: '',
  contract_start: '',
  contract_end: null,
  deposit_amount: 0,
  notes: null,
};

export function TenantForm({
  defaultValues,
  isSubmitting = false,
  submitLabel,
  onSubmit,
}: TenantFormProps) {
  const { t } = useTranslation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<TenantFormValues>({
    resolver: zodResolver(tenantSchema as never),
    defaultValues: { ...defaultFormValues, ...defaultValues },
  });

  const fieldError = (message?: string) => translateFieldError(t, message);

  return (
    <AppFormScroll>
      <AppTextInput
        control={control}
        name="first_name"
        label={t('tenants.firstName')}
        autoCapitalize="words"
        error={fieldError(errors.first_name?.message)}
      />

      <AppTextInput
        control={control}
        name="last_name"
        label={t('tenants.lastName')}
        autoCapitalize="words"
        error={fieldError(errors.last_name?.message)}
      />

      <AppTextInput
        control={control}
        name="email"
        label={t('tenants.email')}
        keyboardType="email-address"
        autoCapitalize="none"
        error={fieldError(errors.email?.message)}
      />

      <AppTextInput
        control={control}
        name="phone"
        label={t('tenants.phone')}
        keyboardType="phone-pad"
        error={fieldError(errors.phone?.message)}
      />

      <Controller
        control={control}
        name="contract_start"
        render={({ field: { value, onChange }, fieldState }) => (
          <AppDatePicker
            label={t('tenants.contractStart')}
            value={parseDateString(value)}
            onChange={(date) => onChange(toDateString(date))}
            error={fieldError(fieldState.error?.message)}
          />
        )}
      />

      <Controller
        control={control}
        name="contract_end"
        render={({ field: { value, onChange }, fieldState }) => (
          <AppDatePicker
            label={t('tenants.contractEnd')}
            value={parseDateString(value)}
            onChange={(date) => onChange(date ? toDateString(date) : null)}
            error={fieldError(fieldState.error?.message)}
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
            error={fieldError(fieldState.error?.message)}
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
        error={fieldError(errors.notes?.message)}
      />

      <AppFormSubmit
        label={submitLabel ?? t('common.save')}
        loading={isSubmitting}
        onPress={handleSubmit(onSubmit)}
      />
    </AppFormScroll>
  );
}
