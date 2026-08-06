import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppCheckbox } from '@/components/ui/AppCheckbox';
import { AppPicker } from '@/components/ui/AppPicker';
import { AppTextInput } from '@/components/ui/AppTextInput';
import { MEMBERSHIP_ROLES } from '@/constants/config';
import { useAppTheme } from '@/hooks/useAppTheme';
import { displayFontFamily, Fonts } from '@/lib/fonts';
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
  const { colors } = theme;

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
        style={{
          fontFamily: displayFontFamily(theme.name),
          fontSize: 18,
          letterSpacing: -0.36,
          color: colors.fg,
          marginBottom: 14,
        }}
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

      <Text
        style={{
          fontFamily: Fonts.sans.semibold,
          fontSize: 12.5,
          lineHeight: 16,
          color: colors.fg,
          marginBottom: 12,
        }}
      >
        {t('members.selectProperties')}
      </Text>

      <View style={styles.propertyList}>
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
        <Text
          style={{
            fontFamily: Fonts.sans.regular,
            fontSize: 12,
            color: colors.neg,
            marginBottom: 12,
          }}
        >
          {translateFieldError(t, form.formState.errors.propertyIds.message)}
        </Text>
      ) : null}

      <Pressable
        onPress={() => void handleInvite()}
        disabled={isInviting}
        accessibilityRole="button"
        accessibilityLabel={t('members.sendInvite')}
        style={[
          styles.sendBtn,
          {
            backgroundColor: colors.primary,
            opacity: isInviting ? 0.7 : 1,
          },
        ]}
      >
        <Text
          style={{
            fontFamily: Fonts.sans.semibold,
            fontSize: 15,
            letterSpacing: -0.15,
            color: colors.onPrimary,
          }}
        >
          {t('members.sendInvite')}
        </Text>
      </Pressable>

      {onCancel ? (
        <Pressable
          onPress={onCancel}
          accessibilityRole="button"
          accessibilityLabel={t('common.cancel')}
          style={styles.cancelBtn}
        >
          <Text
            style={{
              fontFamily: Fonts.sans.semibold,
              fontSize: 14,
              color: colors.muted,
            }}
          >
            {t('common.cancel')}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  propertyList: {
    gap: 4,
    marginBottom: 22,
  },
  sendBtn: {
    height: 50,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    marginTop: 10,
    alignItems: 'center',
    paddingVertical: 10,
  },
});
