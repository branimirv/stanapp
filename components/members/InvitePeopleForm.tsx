import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppCheckbox } from '@/components/ui/AppCheckbox';
import { AppPicker } from '@/components/ui/AppPicker';
import { AppTextInput } from '@/components/ui/AppTextInput';
import { MEMBERSHIP_ROLES } from '@/constants/config';
import { useAppTheme } from '@/hooks/useAppTheme';
import { displayFontFamily } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import type { InviteToPropertiesResult } from '@/services/invites';
import type { MembershipRole, Property } from '@/types/app.types';
import { translateFieldError } from '@/utils/formHelpers';
import { inviteSchema, type InviteFormValues } from '@/utils/validators';

interface InvitePeopleFormProps {
  properties: Property[];
  initialPropertyIds?: string[];
  isInviting: boolean;
  onInvite: (values: InviteFormValues) => Promise<InviteToPropertiesResult>;
  onSuccess: (result: InviteToPropertiesResult) => void;
  onError: (error: Error) => void;
  onCancel?: () => void;
  /** Host BlurOverlay sibling — fire when role picker opens/closes. */
  onSheetVisibilityChange?: (open: boolean) => void;
}

export function InvitePeopleForm({
  properties,
  initialPropertyIds = [],
  isInviting,
  onInvite,
  onSuccess,
  onError,
  onCancel,
  onSheetVisibilityChange,
}: InvitePeopleFormProps) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();

  const form = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema as never),
    defaultValues: {
      email: '',
      role: 'tenant',
      propertyIds: initialPropertyIds,
    },
  });

  const selectedIds = form.watch('propertyIds');
  const initialPropertyKey = initialPropertyIds.join(',');

  useEffect(() => {
    if (!initialPropertyKey) return;
    form.setValue('propertyIds', initialPropertyKey.split(','), { shouldValidate: false });
  }, [form, initialPropertyKey]);

  const handleInvite = form.handleSubmit(async (values) => {
    try {
      const result = await onInvite(values);
      form.reset({
        email: '',
        role: 'tenant',
        propertyIds: initialPropertyKey ? initialPropertyKey.split(',') : [],
      });
      onSuccess(result);
    } catch (err) {
      onError(err instanceof Error ? err : new Error(t('members.inviteFailed')));
    }
  });

  return (
    <View>
      <Text
        className="text-fg mb-3.5 text-lg tracking-[-0.36px]"
        style={{ fontFamily: displayFontFamily(theme.name) }}
      >
        {t('members.invitePeople')}
      </Text>

      <AppTextInput
        control={form.control}
        name="email"
        label={t('common.email')}
        placeholder="ime@example.com"
        autoCapitalize="none"
        keyboardType="email-address"
        error={translateFieldError(t, form.formState.errors.email?.message)}
      />

      <Controller
        control={form.control}
        name="role"
        render={({ field: { value, onChange } }) => (
          <AppPicker<MembershipRole>
            label={t('members.role')}
            placeholder={t('members.selectRole')}
            options={MEMBERSHIP_ROLES.map((role) => ({
              value: role,
              label: t(`members.roles.${role}`),
            }))}
            value={value}
            onValueChange={onChange}
            onVisibilityChange={onSheetVisibilityChange}
          />
        )}
      />

      <Text className="text-fg mb-3 text-[12.5px] leading-4 font-semibold">
        {t('members.selectProperties')}
      </Text>

      <View className="mb-5.5 gap-1">
        {properties.map((property) => {
          const checked = selectedIds.includes(property.id);
          return (
            <AppCheckbox
              key={property.id}
              checked={checked}
              label={property.name}
              onChange={(next) => {
                const current = form.getValues('propertyIds');
                form.setValue(
                  'propertyIds',
                  next
                    ? Array.from(new Set([...current, property.id]))
                    : current.filter((propertyId) => propertyId !== property.id),
                  { shouldValidate: true },
                );
              }}
            />
          );
        })}
      </View>

      {form.formState.errors.propertyIds?.message ? (
        <Text className="text-neg mb-3 text-xs">
          {translateFieldError(t, form.formState.errors.propertyIds.message)}
        </Text>
      ) : null}

      <Pressable
        onPress={() => void handleInvite()}
        disabled={isInviting}
        accessibilityRole="button"
        accessibilityLabel={t('members.sendInvite')}
        className={cn(
          'bg-primary h-[50px] items-center justify-center rounded-full',
          isInviting && 'opacity-70',
        )}
      >
        <Text className="text-on-primary text-[15px] font-semibold tracking-[-0.15px]">
          {t('members.sendInvite')}
        </Text>
      </Pressable>

      {onCancel ? (
        <Pressable
          onPress={onCancel}
          accessibilityRole="button"
          accessibilityLabel={t('common.cancel')}
          className="mt-2.5 items-center py-2.5"
        >
          <Text className="text-muted text-sm font-semibold">{t('common.cancel')}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
