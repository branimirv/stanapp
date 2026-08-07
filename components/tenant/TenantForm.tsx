import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { AppButton } from '@/components/ui/AppButton';
import { AppDatePicker } from '@/components/ui/AppDatePicker';
import { useStackChromeEdgeInset } from '@/components/ui/StackScreenChrome';
import { AppTextInput } from '@/components/ui/AppTextInput';
import { useAppTheme } from '@/hooks/useAppTheme';
import { displayFontFamily } from '@/lib/fonts';
import {
  joinPersonName,
  parseDateString,
  splitPersonName,
  toDateString,
  translateFieldError,
} from '@/utils/formHelpers';
import {
  tenantFormSchema,
  type TenantFormUiValues,
  type TenantFormValues,
} from '@/utils/validators';

export interface TenantFormProps {
  title?: string;
  defaultValues?: Partial<TenantFormValues>;
  isSubmitting?: boolean;
  submitLabel?: string;
  onSubmit: (values: TenantFormValues) => void | Promise<void>;
  /** Host BlurOverlay sibling — fire when date sheets open/close. */
  onSheetVisibilityChange?: (open: boolean) => void;
}

const defaultFormValues: TenantFormUiValues = {
  full_name: '',
  email: '',
  phone: '',
  contract_start: '',
  contract_end: null,
  deposit_amount: 0,
  notes: null,
};

export function TenantForm({
  title,
  defaultValues,
  isSubmitting = false,
  submitLabel,
  onSubmit,
  onSheetVisibilityChange,
}: TenantFormProps) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const edgeInset = useStackChromeEdgeInset();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<TenantFormUiValues>({
    resolver: zodResolver(tenantFormSchema as never),
    defaultValues: {
      ...defaultFormValues,
      ...defaultValues,
      full_name: joinPersonName(defaultValues?.first_name, defaultValues?.last_name),
    },
  });

  const fieldError = (message?: string) => translateFieldError(t, message);

  const handleFormSubmit = handleSubmit((values) => {
    const { first_name, last_name } = splitPersonName(values.full_name);
    return onSubmit({
      first_name,
      last_name,
      email: values.email,
      phone: values.phone,
      contract_start: values.contract_start,
      contract_end: values.contract_end,
      deposit_amount: values.deposit_amount,
      notes: values.notes,
    });
  });

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
            <Text
              className="text-fg text-[32px] leading-8 tracking-[-0.8px]"
              style={{ fontFamily: displayFontFamily(theme.name) }}
              accessibilityRole="header"
            >
              {title}
            </Text>
          </View>
        ) : null}

        <AppTextInput
          control={control}
          name="full_name"
          label={t('tenants.fullName')}
          placeholder={t('tenants.fullName')}
          autoCapitalize="words"
          error={fieldError(errors.full_name?.message)}
        />

        <AppTextInput
          control={control}
          name="email"
          label={t('tenants.email')}
          placeholder={t('tenants.emailPlaceholder')}
          keyboardType="email-address"
          autoCapitalize="none"
          error={fieldError(errors.email?.message)}
        />

        <AppTextInput
          control={control}
          name="phone"
          label={t('tenants.phone')}
          placeholder={t('tenants.phonePlaceholder')}
          keyboardType="phone-pad"
          error={fieldError(errors.phone?.message)}
        />

        <View className="mb-4.5 flex-row gap-2.5">
          <View className="flex-1">
            <Controller
              control={control}
              name="contract_start"
              render={({ field: { value, onChange }, fieldState }) => (
                <AppDatePicker
                  label={t('tenants.contractStart')}
                  placeholder={t('ui.selectDate')}
                  value={parseDateString(value)}
                  onChange={(date) => onChange(toDateString(date))}
                  error={fieldError(fieldState.error?.message)}
                  onVisibilityChange={onSheetVisibilityChange}
                />
              )}
            />
          </View>
          <View className="flex-1">
            <Controller
              control={control}
              name="contract_end"
              render={({ field: { value, onChange }, fieldState }) => (
                <AppDatePicker
                  label={t('tenants.contractEnd')}
                  placeholder={t('tenants.noEndDateShort')}
                  value={parseDateString(value)}
                  onChange={(date) => onChange(date ? toDateString(date) : null)}
                  error={fieldError(fieldState.error?.message)}
                  onVisibilityChange={onSheetVisibilityChange}
                />
              )}
            />
          </View>
        </View>

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
              className="pl-13"
              left={<Text className="text-muted text-sm font-medium">EUR</Text>}
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
          containerStyle={{ marginBottom: 0 }}
        />
      </ScrollView>

      <View
        className="bg-bg px-gutter pt-3.5"
        style={{ paddingBottom: Math.max(insets.bottom, 14) + 8 }}
      >
        <AppButton
          mode="contained"
          loading={isSubmitting}
          onPress={handleFormSubmit}
          className="h-11 w-full"
          accessibilityLabel={submitLabel ?? t('tenants.addNew')}
        >
          {submitLabel ?? t('tenants.addNew')}
        </AppButton>
      </View>
    </View>
  );
}
