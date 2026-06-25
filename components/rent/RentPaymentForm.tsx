import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { AppButton } from '@/components/ui/AppButton';
import { AppDatePicker } from '@/components/ui/AppDatePicker';
import { AppPicker } from '@/components/ui/AppPicker';
import { AppTextInput } from '@/components/ui/AppTextInput';
import { PAYMENT_STATUSES } from '@/constants/config';
import { Spacing, Typography } from '@/constants/theme';
import type { PaymentStatus, Property, Tenant } from '@/types/app.types';
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

export function RentPaymentForm({
  defaultValues,
  properties,
  tenants,
  isSubmitting = false,
  submitLabel,
  onSubmit,
}: RentPaymentFormProps) {
  const theme = useTheme();
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
            label={t('rent.property')}
            placeholder={t('rent.selectProperty')}
            options={propertyOptions}
            value={value || null}
            onValueChange={(next) => {
              onChange(next);
              setValue('tenant_id', '');
            }}
            error={translateError(fieldState.error?.message)}
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
            error={translateError(fieldState.error?.message)}
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
            error={translateError(fieldState.error?.message)}
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
                error={translateError(fieldState.error?.message)}
              />
            )}
          />
        </View>

        <View style={styles.periodField}>
          <Text style={[styles.periodLabel, { color: theme.colors.onSurface }]}>
            {t('rent.periodYear')}
          </Text>
          <Controller
            control={control}
            name="period_year"
            render={({ field: { value, onChange, onBlur }, fieldState }) => (
              <AppTextInput
                value={String(value)}
                onChangeText={(text) => {
                  const parsed = Number.parseInt(text, 10);
                  onChange(Number.isNaN(parsed) ? new Date().getFullYear() : parsed);
                }}
                onBlur={onBlur}
                keyboardType="number-pad"
                placeholder={String(new Date().getFullYear())}
                style={styles.periodInput}
                error={translateError(fieldState.error?.message)}
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
            error={translateError(fieldState.error?.message)}
          />
        )}
      />

      <Controller
        control={control}
        name="payment_date"
        render={({ field: { value, onChange }, fieldState }) => (
          <AppDatePicker
            label={t('rent.paymentDate')}
            value={parseDateValue(value)}
            onChange={(date) => onChange(date ? formatDateValue(date) : null)}
            error={translateError(fieldState.error?.message)}
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
  periodRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  periodField: {
    flex: 1,
  },
  periodLabel: {
    ...Typography.labelLarge,
    marginBottom: Spacing.xs,
  },
  periodInput: {
    height: 56,
  },
  submit: {
    marginTop: Spacing.sm,
  },
});
