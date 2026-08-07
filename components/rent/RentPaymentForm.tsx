import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { AppButton } from '@/components/ui/AppButton';
import { AppDatePicker } from '@/components/ui/AppDatePicker';
import { AppPicker } from '@/components/ui/AppPicker';
import { useStackChromeEdgeInset } from '@/components/ui/StackScreenChrome';
import { AppTextInput } from '@/components/ui/AppTextInput';
import { PAYMENT_STATUSES } from '@/constants/config';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocale } from '@/hooks/useLocale';
import { displayFontFamily } from '@/lib/fonts';
import type { PaymentStatus, Property, Tenant } from '@/types/app.types';
import { parseDateString, toDateString, translateFieldError } from '@/utils/formHelpers';
import { formatMonthName } from '@/utils/formatters';
import { rentPaymentSchema, type RentPaymentFormValues } from '@/utils/validators';

export interface RentPaymentFormProps {
  title?: string;
  /** Eyebrow above title — property context (Naslov: no property field when set). */
  eyebrow?: string;
  /** When true, hide the property picker (context from eyebrow / locked id). */
  hidePropertyField?: boolean;
  defaultValues?: Partial<RentPaymentFormValues>;
  properties: Property[];
  tenants: Tenant[];
  isSubmitting?: boolean;
  submitLabel?: string;
  onSubmit: (values: RentPaymentFormValues) => void | Promise<void>;
  /** Host BlurOverlay sibling — fire when any picker/date sheet opens or closes. */
  onSheetVisibilityChange?: (open: boolean) => void;
}

const defaultFormValues: RentPaymentFormValues = {
  property_id: '',
  tenant_id: '',
  amount: 0,
  period_month: new Date().getMonth() + 1,
  period_year: new Date().getFullYear(),
  status: 'paid',
  payment_date: toDateString(new Date()),
  notes: null,
};

export function RentPaymentForm({
  title,
  eyebrow,
  hidePropertyField = false,
  defaultValues,
  properties,
  tenants,
  isSubmitting = false,
  submitLabel,
  onSubmit,
  onSheetVisibilityChange,
}: RentPaymentFormProps) {
  const { t } = useTranslation();
  const { language } = useLocale();
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const edgeInset = useStackChromeEdgeInset();

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

  const monthOptions = useMemo(
    () =>
      Array.from({ length: 12 }, (_, index) => {
        const month = index + 1;
        const name = formatMonthName(month, 2026, language).replace(/\.$/, '');
        const label =
          name.charAt(0).toLocaleUpperCase(language === 'en' ? 'en' : 'hr') + name.slice(1);
        return { value: String(month), label };
      }),
    [language],
  );

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
    <View className="flex-1">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: theme.spacing.gutter,
          paddingTop: (edgeInset ?? 0) + 8,
          paddingBottom: 24,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {title ? (
          <View className="mb-5.5">
            {eyebrow ? (
              <Text className="text-muted mb-2.5 text-[11px] font-semibold tracking-[1.54px] uppercase">
                {eyebrow}
              </Text>
            ) : null}
            <Text
              className="text-fg text-[32px] leading-8 tracking-[-0.8px]"
              style={{ fontFamily: displayFontFamily(theme.name) }}
              accessibilityRole="header"
            >
              {title}
            </Text>
          </View>
        ) : null}

        {!hidePropertyField ? (
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
                style={{ marginBottom: 18 }}
                onVisibilityChange={onSheetVisibilityChange}
              />
            )}
          />
        ) : null}

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
              style={{ marginBottom: 18 }}
              onVisibilityChange={onSheetVisibilityChange}
            />
          )}
        />

        <Controller
          control={control}
          name="amount"
          render={({ field: { value, onChange, onBlur }, fieldState }) => (
            <AppTextInput
              label={t('rent.amount')}
              value={value ? String(value) : ''}
              onChangeText={(text) => {
                const parsed = Number.parseFloat(text.replace(',', '.'));
                onChange(Number.isNaN(parsed) ? 0 : parsed);
              }}
              onBlur={onBlur}
              keyboardType="decimal-pad"
              error={fieldError(fieldState.error?.message)}
              className="pl-13"
              left={<Text className="text-muted text-sm font-medium">EUR</Text>}
            />
          )}
        />

        <View className="mb-4.5 flex-row gap-2.5">
          <View className="flex-1">
            <Controller
              control={control}
              name="period_month"
              render={({ field: { value, onChange }, fieldState }) => (
                <AppPicker
                  label={t('rent.periodMonth')}
                  options={monthOptions}
                  value={String(value)}
                  onValueChange={(next) => onChange(Number.parseInt(next, 10))}
                  error={fieldError(fieldState.error?.message)}
                  onVisibilityChange={onSheetVisibilityChange}
                />
              )}
            />
          </View>

          <View className="flex-1">
            <Controller
              control={control}
              name="period_year"
              render={({ field: { value, onChange, onBlur }, fieldState }) => (
                <AppTextInput
                  label={t('rent.periodYear')}
                  value={value != null ? String(value) : String(new Date().getFullYear())}
                  onChangeText={(text) => {
                    const parsed = Number.parseInt(text, 10);
                    onChange(Number.isNaN(parsed) ? new Date().getFullYear() : parsed);
                  }}
                  onBlur={onBlur}
                  keyboardType="number-pad"
                  placeholder={String(new Date().getFullYear())}
                  error={fieldError(fieldState.error?.message)}
                  containerStyle={{ marginBottom: 0 }}
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
              style={{ marginBottom: 18 }}
              onVisibilityChange={onSheetVisibilityChange}
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
              style={{ marginBottom: 18 }}
              onVisibilityChange={onSheetVisibilityChange}
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
          containerStyle={{ marginBottom: 0 }}
        />
      </ScrollView>

      <View
        className="bg-bg px-gutter pt-3.5"
        style={{ paddingBottom: Math.max(insets.bottom, 14) + 8 }}
      >
        <AppButton
          variant="default"
          loading={isSubmitting}
          onPress={handleSubmit(onSubmit)}
          className="h-11 w-full"
          accessibilityLabel={submitLabel ?? t('properties.recordPayment')}
        >
          {submitLabel ?? t('properties.recordPayment')}
        </AppButton>
      </View>
    </View>
  );
}
