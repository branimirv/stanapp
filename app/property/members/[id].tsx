import { zodResolver } from '@hookform/resolvers/zod';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import { AppButton } from '@/components/ui/AppButton';
import { AppCheckbox } from '@/components/ui/AppCheckbox';
import { AppFormScroll, AppFormSection, AppFormSubmit } from '@/components/ui/AppFormScroll';
import { AppPicker } from '@/components/ui/AppPicker';
import { AppTextInput } from '@/components/ui/AppTextInput';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { MEMBERSHIP_ROLES } from '@/constants/config';
import { Spacing, Typography } from '@/constants/theme';
import { useMyMembership, useMyMemberships, usePropertyInvites, usePropertyMembers } from '@/hooks/useMembers';
import { useProperties } from '@/hooks/useProperties';
import { useAuthStore } from '@/stores/authStore';
import { useUiStore } from '@/stores/uiStore';
import type { MembershipRole } from '@/types/app.types';
import { translateFieldError } from '@/utils/formHelpers';
import { inviteSchema, type InviteFormValues } from '@/utils/validators';

export default function PropertyMembersScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const theme = useTheme();
  const showToast = useUiStore((s) => s.showToast);
  const showConfirmDialog = useUiStore((s) => s.showConfirmDialog);
  const user = useAuthStore((s) => s.user);

  const { properties } = useProperties();
  const { memberships } = useMyMemberships();
  const { isOwner, isLoading: membershipLoading } = useMyMembership(id);
  const {
    members,
    isLoading: membersLoading,
    error: membersError,
    refetch: refetchMembers,
    revoke: revokeMember,
  } = usePropertyMembers(id);
  const {
    invites,
    isLoading: invitesLoading,
    error: invitesError,
    refetch: refetchInvites,
    invite,
    isInviting,
    revoke: revokeInvite,
  } = usePropertyInvites(id);

  const [showInviteForm, setShowInviteForm] = useState(false);

  const ownedPropertyIds = useMemo(
    () =>
      new Set(
        memberships.filter((membership) => membership.role === 'owner').map((m) => m.property_id),
      ),
    [memberships],
  );

  const selectableProperties = useMemo(
    () =>
      properties.filter((property) => !property.is_archived && ownedPropertyIds.has(property.id)),
    [ownedPropertyIds, properties],
  );

  const form = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema as never),
    defaultValues: {
      email: '',
      role: 'tenant',
      propertyIds: id ? [id] : [],
    },
  });

  const selectedIds = form.watch('propertyIds');

  const handleInvite = form.handleSubmit(async (values) => {
    try {
      const result = await invite(values);
      showToast({
        message: result.authInviteSent
          ? t('members.inviteSent')
          : t('members.invitePendingExisting'),
        type: 'success',
      });
      form.reset({ email: '', role: 'tenant', propertyIds: id ? [id] : [] });
      setShowInviteForm(false);
      await refetchInvites();
    } catch (err) {
      showToast({
        message: err instanceof Error ? err.message : t('members.inviteFailed'),
        type: 'error',
      });
    }
  });

  const handleRevokeMember = (memberId: string, name: string) => {
    showConfirmDialog({
      title: t('confirm.revokeMemberTitle'),
      message: t('confirm.revokeMemberMessage', { name }),
      confirmLabel: 'common.remove',
      destructive: true,
      onConfirm: async () => {
        try {
          await revokeMember(memberId);
          showToast({ message: t('members.memberRemoved'), type: 'success' });
        } catch (err) {
          showToast({
            message: err instanceof Error ? err.message : t('members.memberRemoveFailed'),
            type: 'error',
          });
        }
      },
    });
  };

  const handleRevokeInvite = (inviteId: string, email: string) => {
    showConfirmDialog({
      title: t('confirm.revokeInviteTitle'),
      message: t('confirm.revokeInviteMessage', { email }),
      confirmLabel: 'common.remove',
      destructive: true,
      onConfirm: async () => {
        try {
          await revokeInvite(inviteId);
          showToast({ message: t('members.inviteRevoked'), type: 'success' });
        } catch (err) {
          showToast({
            message: err instanceof Error ? err.message : t('members.inviteRevokeFailed'),
            type: 'error',
          });
        }
      },
    });
  };

  const isLoading = membershipLoading || membersLoading || invitesLoading;

  if (isLoading && members.length === 0) {
    return (
      <>
        <Stack.Screen options={{ title: t('members.title') }} />
        <SkeletonLoader count={4} style={styles.loader} />
      </>
    );
  }

  if (!isOwner) {
    return (
      <>
        <Stack.Screen options={{ title: t('members.title') }} />
        <ErrorState message={t('members.ownersOnly')} onRetry={() => router.back()} />
      </>
    );
  }

  if (membersError || invitesError) {
    return (
      <>
        <Stack.Screen options={{ title: t('members.title') }} />
        <ErrorState
          message={membersError ?? invitesError ?? t('members.loadFailed')}
          onRetry={() => {
            void refetchMembers();
            void refetchInvites();
          }}
        />
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: t('members.title') }} />
      <AppFormScroll>
        <AppFormSection label={t('members.membersSection')}>
          {members.length === 0 ? (
            <EmptyState title={t('members.noMembers')} />
          ) : (
            members.map((member) => {
              const name = member.profile?.full_name ?? t('members.unknownUser');
              const isSelf = member.user_id === user?.id;
              return (
                <View
                  key={member.id}
                  style={[styles.row, { borderColor: theme.colors.outlineVariant }]}
                >
                  <View style={styles.rowText}>
                    <Text style={[styles.name, { color: theme.colors.onSurface }]}>{name}</Text>
                    <Text style={{ color: theme.colors.onSurfaceVariant }}>
                      {t(`members.roles.${member.role}`)}
                      {isSelf ? ` · ${t('members.you')}` : ''}
                    </Text>
                  </View>
                  {!isSelf ? (
                    <Pressable onPress={() => handleRevokeMember(member.id, name)}>
                      <Text style={{ color: theme.colors.error }}>{t('common.remove')}</Text>
                    </Pressable>
                  ) : null}
                </View>
              );
            })
          )}
        </AppFormSection>

        <AppFormSection label={t('members.pendingInvites')}>
          {invites.length === 0 ? (
            <Text style={{ color: theme.colors.onSurfaceVariant }}>{t('members.noPending')}</Text>
          ) : (
            invites.map((inviteItem) => (
              <View
                key={inviteItem.id}
                style={[styles.row, { borderColor: theme.colors.outlineVariant }]}
              >
                <View style={styles.rowText}>
                  <Text style={[styles.name, { color: theme.colors.onSurface }]}>
                    {inviteItem.email}
                  </Text>
                  <Text style={{ color: theme.colors.onSurfaceVariant }}>
                    {t(`members.roles.${inviteItem.role}`)}
                  </Text>
                </View>
                <Pressable onPress={() => handleRevokeInvite(inviteItem.id, inviteItem.email)}>
                  <Text style={{ color: theme.colors.error }}>{t('common.remove')}</Text>
                </Pressable>
              </View>
            ))
          )}
        </AppFormSection>

        {!showInviteForm ? (
          <AppButton mode="contained" onPress={() => setShowInviteForm(true)}>
            {t('members.invitePeople')}
          </AppButton>
        ) : (
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

            <Text style={[styles.sectionHint, { color: theme.colors.onSurfaceVariant }]}>
              {t('members.selectProperties')}
            </Text>
            {selectableProperties.map((property) => {
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
              <Text style={{ color: theme.colors.error }}>
                {translateFieldError(t, form.formState.errors.propertyIds.message)}
              </Text>
            ) : null}

            <AppFormSubmit
              label={t('members.sendInvite')}
              loading={isInviting}
              onPress={() => void handleInvite()}
            />
            <AppButton mode="text" onPress={() => setShowInviteForm(false)}>
              {t('common.cancel')}
            </AppButton>
          </AppFormSection>
        )}
      </AppFormScroll>
    </>
  );
}

const styles = StyleSheet.create({
  loader: {
    padding: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  name: {
    ...Typography.bodyLarge,
  },
  sectionHint: {
    ...Typography.bodySmall,
    marginBottom: Spacing.xs,
  },
});
