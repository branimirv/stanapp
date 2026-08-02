import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppButton } from '@/components/ui/AppButton';
import { AppCheckbox } from '@/components/ui/AppCheckbox';
import { AppFormSection, AppFormSubmit } from '@/components/ui/AppFormScroll';
import { AppPicker } from '@/components/ui/AppPicker';
import { AppTextInput } from '@/components/ui/AppTextInput';
import { Text } from '@/components/ui/text';
import { MEMBERSHIP_ROLES } from '@/constants/config';
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
}

export function InvitePeopleForm({
  properties,
  initialPropertyIds = [],
  isInviting,
  onInvite,
  onSuccess,
  onError,
  onCancel,
}: InvitePeopleFormProps) {
  const { t } = useTranslation();

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
    <AppFormSection label={t('members.invitePeople')}>
      <AppTextInput
        control={form.control}
        name="email"
        label={t('common.email')}
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
            options={MEMBERSHIP_ROLES.map((role) => ({
              value: role,
              label: t(`members.roles.${role}`),
            }))}
            value={value}
            onValueChange={onChange}
          />
        )}
      />

      <Text className="text-muted-foreground mb-1 text-xs">{t('members.selectProperties')}</Text>
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
      {form.formState.errors.propertyIds?.message ? (
        <Text className="text-destructive">
          {translateFieldError(t, form.formState.errors.propertyIds.message)}
        </Text>
      ) : null}

      <AppFormSubmit
        label={t('members.sendInvite')}
        loading={isInviting}
        onPress={() => void handleInvite()}
      />
      {onCancel ? (
        <View>
          <AppButton mode="text" onPress={onCancel}>
            {t('common.cancel')}
          </AppButton>
        </View>
      ) : null}
    </AppFormSection>
  );
}
