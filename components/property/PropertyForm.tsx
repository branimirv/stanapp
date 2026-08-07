import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '@/components/ui/AppButton';
import { AppPicker } from '@/components/ui/AppPicker';
import { AppSegmentedControl } from '@/components/ui/AppSegmentedControl';
import { useStackChromeEdgeInset } from '@/components/ui/StackScreenChrome';
import { AppTextInput } from '@/components/ui/AppTextInput';
import { PROPERTY_TYPES, USAGE_STATUSES } from '@/constants/config';
import { useAppTheme } from '@/hooks/useAppTheme';
import { displayFontFamily } from '@/lib/fonts';
import type { Property, PropertyType, UsageStatus } from '@/types/app.types';
import { translateFieldError } from '@/utils/formHelpers';
import { propertySchema, type PropertyFormValues } from '@/utils/validators';

const TYPE_SEGMENTS = PROPERTY_TYPES.map((type) => ({
  value: type,
  labelKey: `propertyTypes.${type}`,
}));

const USAGE_SEGMENTS = USAGE_STATUSES.map((status) => ({
  value: status,
  labelKey: `usageStatus.${status}`,
}));

export interface PropertyFormProps {
  title?: string;
  defaultValues?: Partial<PropertyFormValues>;
  initialValues?: Partial<PropertyFormValues>;
  parentProperties?: Property[];
  isSubmitting?: boolean;
  isLoading?: boolean;
  submitLabel?: string;
  onSubmit: (values: PropertyFormValues) => void | Promise<void>;
  onUsageStatusChangeAwayFromRented?: () => boolean | Promise<boolean>;
  onUsageStatusChange?: (
    from: UsageStatus,
    to: UsageStatus,
  ) => boolean | Promise<boolean>;
}

const defaultFormValues: PropertyFormValues = {
  type: 'apartment',
  usage_status: 'personal_use',
  parent_property_id: null,
  name: '',
  address: '',
  floor: null,
  area_sqm: null,
  rent_amount: 0,
  notes: null,
};

function FieldLab({ label }: { label: string }) {
  return (
    <Text className="text-fg mb-2 text-[13px] leading-gutter font-semibold">{label}</Text>
  );
}

export function PropertyForm({
  title,
  defaultValues,
  initialValues,
  parentProperties = [],
  isSubmitting = false,
  isLoading = false,
  submitLabel,
  onSubmit,
  onUsageStatusChangeAwayFromRented,
  onUsageStatusChange,
}: PropertyFormProps) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const edgeInset = useStackChromeEdgeInset();
  const resolvedDefaults = { ...defaultFormValues, ...defaultValues, ...initialValues };
  const submitting = isSubmitting || isLoading;

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema as never),
    defaultValues: resolvedDefaults,
  });

  const selectedType = watch('type');
  const selectedUsage = watch('usage_status');
  const initialUsage = resolvedDefaults.usage_status;
  const showFloor = selectedType === 'apartment';

  useEffect(() => {
    if (selectedType !== 'garage') {
      setValue('parent_property_id', null);
    }
  }, [selectedType, setValue]);

  useEffect(() => {
    if (selectedType !== 'apartment') {
      setValue('floor', null);
    }
  }, [selectedType, setValue]);

  const parentOptions = useMemo(
    () =>
      parentProperties
        .filter((property) => property.type !== 'garage')
        .map((property) => ({
          label: property.name,
          value: property.id,
        })),
    [parentProperties],
  );

  const typeSegments = TYPE_SEGMENTS.map((segment) => ({
    value: segment.value,
    label: t(segment.labelKey),
  }));

  const usageSegments = USAGE_SEGMENTS.map((segment) => ({
    value: segment.value,
    label: t(segment.labelKey),
  }));

  const handleUsageChange = async (nextStatus: UsageStatus) => {
    if (initialUsage === 'rented' && nextStatus !== 'rented') {
      if (onUsageStatusChange) {
        const allowed = await onUsageStatusChange(initialUsage, nextStatus);
        if (!allowed) return;
      } else if (onUsageStatusChangeAwayFromRented) {
        const allowed = await onUsageStatusChangeAwayFromRented();
        if (!allowed) return;
      }
    }
    setValue('usage_status', nextStatus, { shouldValidate: true });
  };

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
          <Text
            className="text-fg mb-5.5 text-[32px] leading-8 tracking-[-0.8px]"
            style={{ fontFamily: displayFontFamily(theme.name) }}
            accessibilityRole="header"
          >
            {title}
          </Text>
        ) : null}

        <View className="mb-4.5">
          <FieldLab label={t('properties.type')} />
          <Controller
            control={control}
            name="type"
            render={({ field: { value, onChange } }) => (
              <AppSegmentedControl
                variant="picker"
                segments={typeSegments}
                value={value}
                onValueChange={(next) => onChange(next as PropertyType)}
              />
            )}
          />
        </View>

        <View className="mb-4.5">
          <FieldLab label={t('properties.usageStatus')} />
          <Controller
            control={control}
            name="usage_status"
            render={({ field: { value } }) => (
              <AppSegmentedControl
                variant="picker"
                segments={usageSegments}
                value={value}
                onValueChange={(next) => void handleUsageChange(next as UsageStatus)}
              />
            )}
          />
        </View>

        <AppTextInput
          control={control}
          name="name"
          label={t('properties.name')}
          placeholder={t('properties.namePlaceholder')}
          error={fieldError(errors.name?.message)}
        />

        <AppTextInput
          control={control}
          name="address"
          label={t('properties.address')}
          placeholder={t('properties.addressPlaceholder')}
          error={fieldError(errors.address?.message)}
        />

        <View className="flex-row gap-2.5">
          <View className="flex-1">
            <Controller
              control={control}
              name="floor"
              render={({ field: { value, onChange, onBlur }, fieldState }) => (
                <AppTextInput
                  label={t('properties.floor')}
                  placeholder={t('properties.floorPlaceholder')}
                  value={showFloor && value != null ? String(value) : ''}
                  onChangeText={(text) => {
                    if (!showFloor) return;
                    const parsed = text.trim() === '' ? null : Number.parseInt(text, 10);
                    onChange(Number.isNaN(parsed) ? null : parsed);
                  }}
                  onBlur={onBlur}
                  keyboardType="number-pad"
                  editable={showFloor}
                  error={fieldError(fieldState.error?.message)}
                />
              )}
            />
          </View>
          <View className="flex-1">
            <Controller
              control={control}
              name="area_sqm"
              render={({ field: { value, onChange, onBlur }, fieldState }) => (
                <AppTextInput
                  label={t('properties.area')}
                  placeholder={t('properties.areaPlaceholder')}
                  value={value != null ? String(value) : ''}
                  onChangeText={(text) => {
                    const parsed =
                      text.trim() === '' ? null : Number.parseFloat(text.replace(',', '.'));
                    onChange(parsed == null || Number.isNaN(parsed) ? null : parsed);
                  }}
                  onBlur={onBlur}
                  keyboardType="decimal-pad"
                  error={fieldError(fieldState.error?.message)}
                />
              )}
            />
          </View>
        </View>

        {selectedUsage === 'rented' ? (
          <Controller
            control={control}
            name="rent_amount"
            render={({ field: { value, onChange, onBlur }, fieldState }) => (
              <AppTextInput
                label={t('properties.rentAmount')}
                placeholder={t('properties.rentAmountPlaceholder')}
                value={value ? String(value) : ''}
                onChangeText={(text) => {
                  const parsed = Number.parseFloat(text.replace(',', '.'));
                  onChange(Number.isNaN(parsed) ? 0 : parsed);
                }}
                onBlur={onBlur}
                keyboardType="decimal-pad"
                error={fieldError(fieldState.error?.message)}
                left={<Text className="text-muted text-sm font-medium">EUR</Text>}
              />
            )}
          />
        ) : null}

        {selectedType === 'garage' ? (
          <Controller
            control={control}
            name="parent_property_id"
            render={({ field: { value, onChange }, fieldState }) => (
              <View className="mb-4.5">
                <AppPicker
                  label={t('properties.parentProperty')}
                  placeholder={t('common.none')}
                  options={parentOptions}
                  value={value ?? null}
                  onValueChange={onChange}
                  error={fieldError(fieldState.error?.message)}
                />
                <Text className="text-muted mt-2 text-xs leading-4">
                  {t('properties.parentPropertyHint')}
                </Text>
              </View>
            )}
          />
        ) : null}

        <AppTextInput
          control={control}
          name="notes"
          label={t('properties.notes')}
          placeholder={t('properties.notesPlaceholder')}
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
          loading={submitting}
          onPress={handleSubmit(onSubmit)}
          className="h-11 w-full"
        >
          {submitLabel ?? t('common.save')}
        </AppButton>
      </View>
    </View>
  );
}
