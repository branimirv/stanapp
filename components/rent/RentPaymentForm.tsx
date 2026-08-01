import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppDatePicker } from '@/components/ui/AppDatePicker';
import { AppFormScroll, AppFormSubmit } from '@/components/ui/AppFormScroll';
import { AppPicker } from '@/components/ui/AppPicker';
import { AppTextInput } from '@/components/ui/AppTextInput';
import { Text } from '@/components/ui/text';
import { PAYMENT_STATUSES } from '@/constants/config';
import { Spacing } from '@/constants/theme';
import type { PaymentStatus, Property, Tenant } from '@/types/app.types';
import { parseDateString, toDateString, translateFieldError } from '@/utils/formHelpers';
import { rentPaymentSchema, type RentPaymentFormValues } from '@/utils/validators';

export interface RentPaymentFormProps {
  defaultValues?: Partial<RentPaymentFormValues>;
  properties: Property[];
  tenants: Tenant[];
  isSubmitting?: boolean;
  submitLabel?: string;
  onSubmit: (values: RentPaymentFormValues) => void | Promise<void>;
}

const defaultFormValues: RentPaymentFormValues = {
  property_id: '',
  tenant_id: '',
  amount: 0,
  period_month: new Date().getMonth() + 1,
  period_year: new Date().getFullYear(),
  status: 'pending',
  payment_date: null,
  notes: null,
};

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, index) => ({
  value: String(index + 1),
  label: String(index + 1).padStart(2, '0'),
}));

export function RentPaymentForm({
  defaultValues,
  properties,
  tenants,
  isSubmitting = false,
  submitLabel,
  onSubmit,
}: RentPaymentFormProps) {
  const { t } = useTranslation();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RentPaymentFormValues>({
    resolver: zodResolver(rentPaymentSchema as never),
    defaultValues: { ...defaultFormValues, ...defaultValues },
  });

  const selectedPropertyId = watch('property_id');
  const selectedProperty = properties.find((property) => property.id === selectedPropertyId);

  useEffect(() => {
    if (selectedProperty && Number(selectedProperty.rent_amount) > 0) {
      setValue('amount', Number(selectedProperty.rent_amount));
    }
  }, [selectedProperty, setValue]);

  const propertyOptions = properties
    .filter((property) => property.usage_status === 'rented')
    .map((property) => ({
      label: property.name,
      value: property.id,
    }));

  const tenantOptions = tenants
    .filter((tenant) => tenant.property_id === selectedPropertyId && tenant.is_active)
    .map((tenant) => ({
      label: `${tenant.first_name} ${tenant.last_name}`,
      value: tenant.id,
    }));

  const statusOptions = PAYMENT_STATUSES.map((status) => ({
    label: t(`rent.${status}`),
    value: status,
  }));

  const fieldError = (message?: string) => translateFieldError(t, message);

  return (
    <AppFormScroll>
      <Controller
        control={control}
        name="property_id"
        render={({ field: { value, onChange }, fieldState }) => (
          <AppPicker
            label={t('rent.property')}
            placeholder={t('rent.selectProperty')}
            options={propertyOptions}
            value={value || null}
            onValueChange={(next) => {
              onChange(next);
              setValue('tenant_id', '');
            }}
            error={fieldError(fieldState.error?.message)}
          />
        )}
      />

      <Controller
        control={control}
        name="tenant_id"
        render={({ field: { value, onChange }, fieldState }) => (
          <AppPicker
            label={t('rent.tenant')}
            placeholder={t('rent.selectTenant')}
            options={tenantOptions}
            value={value || null}
            onValueChange={onChange}
            disabled={!selectedPropertyId}
            error={fieldError(fieldState.error?.message)}
          />
        )}
      />

      <Controller
        control={control}
        name="amount"
        render={({ field: { value, onChange, onBlur }, fieldState }) => (
          <AppTextInput
            label={t('rent.amount')}
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

      <View style={styles.periodRow}>
        <View style={styles.periodField}>
          <Controller
            control={control}
            name="period_month"
            render={({ field: { value, onChange }, fieldState }) => (
              <AppPicker
                label={t('rent.periodMonth')}
                options={MONTH_OPTIONS.map((option) => ({
                  label: option.label,
                  value: option.value,
                }))}
                value={String(value)}
                onValueChange={(next) => onChange(Number.parseInt(next, 10))}
                error={fieldError(fieldState.error?.message)}
              />
            )}
          />
        </View>

        <View style={styles.periodField}>
          <Text className="mb-1 text-sm font-semibold">{t('rent.periodYear')}</Text>
          <Controller
            control={control}
            name="period_year"
            render={({ field: { value, onChange, onBlur }, fieldState }) => (
              <AppTextInput
                value={value != null ? String(value) : String(new Date().getFullYear())}
                onChangeText={(text) => {
                  const parsed = Number.parseInt(text, 10);
                  onChange(Number.isNaN(parsed) ? new Date().getFullYear() : parsed);
                }}
                onBlur={onBlur}
                keyboardType="number-pad"
                placeholder={String(new Date().getFullYear())}
                style={styles.periodInput}
                error={fieldError(fieldState.error?.message)}
              />
            )}
          />
        </View>
      </View>

      <Controller
        control={control}
        name="status"
        render={({ field: { value, onChange }, fieldState }) => (
          <AppPicker
            label={t('rent.status')}
            options={statusOptions}
            value={value}
            onValueChange={(next) => onChange(next as PaymentStatus)}
            error={fieldError(fieldState.error?.message)}
          />
        )}
      />

      <Controller
        control={control}
        name="payment_date"
        render={({ field: { value, onChange }, fieldState }) => (
          <AppDatePicker
            label={t('rent.paymentDate')}
            value={parseDateString(value)}
            onChange={(date) => onChange(date ? toDateString(date) : null)}
            error={fieldError(fieldState.error?.message)}
          />
        )}
      />

      <AppTextInput
        control={control}
        name="notes"
        label={t('rent.notes')}
        placeholder={t('rent.notesPlaceholder')}
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

const styles = StyleSheet.create({
  periodRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  periodField: {
    flex: 1,
  },
  periodInput: {
    height: 56,
  },
});
