import { useLocalSearchParams } from 'expo-router';
import { Trash2 } from 'lucide-react-native';
import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { InvitePeopleForm } from '@/components/members/InvitePeopleForm';
import { AppFormScroll, AppFormSection } from '@/components/ui/AppFormScroll';
import { ErrorState } from '@/components/ui/ErrorState';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { StackScreenChrome } from '@/components/ui/StackScreenChrome';
import { Text } from '@/components/ui/text';
import { Colors, Spacing } from '@/constants/theme';
import { useMyMemberships, useOwnedPendingInvites } from '@/hooks/useMembers';
import { useProperties } from '@/hooks/useProperties';
import { useUiStore } from '@/stores/uiStore';

export default function TeamAccessScreen() {
  const { t } = useTranslation();
  const { propertyId: propertyIdParam } = useLocalSearchParams<{ propertyId?: string }>();
  const showToast = useUiStore((s) => s.showToast);
  const showConfirmDialog = useUiStore((s) => s.showConfirmDialog);

  const { properties, isLoading: propertiesLoading } = useProperties();
  const { memberships, isLoading: membershipsLoading } = useMyMemberships();
  const {
    invites,
    isLoading: invitesLoading,
    error: invitesError,
    refetch: refetchInvites,
    invite,
    isInviting,
    revoke: revokeInvite,
  } = useOwnedPendingInvites();

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

  const initialPropertyIds = useMemo(() => {
    if (!propertyIdParam || !ownedPropertyIds.has(propertyIdParam)) return [];
    return [propertyIdParam];
  }, [ownedPropertyIds, propertyIdParam]);

  const isOwnerAnywhere = ownedPropertyIds.size > 0;
  const isLoading = propertiesLoading || membershipsLoading || invitesLoading;

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

  if (isLoading && selectableProperties.length === 0) {
    return (
      <StackScreenChrome title={t('members.teamTitle')}>
        <SkeletonLoader count={4} style={styles.loader} />
      </StackScreenChrome>
    );
  }

  if (!isOwnerAnywhere) {
    return (
      <StackScreenChrome title={t('members.teamTitle')}>
        <ErrorState message={t('members.ownersOnly')} />
      </StackScreenChrome>
    );
  }

  if (invitesError) {
    return (
      <StackScreenChrome title={t('members.teamTitle')}>
        <ErrorState message={invitesError} onRetry={() => void refetchInvites()} />
      </StackScreenChrome>
    );
  }

  return (
    <StackScreenChrome title={t('members.teamTitle')}>
      <AppFormScroll>
        <InvitePeopleForm
          properties={selectableProperties}
          initialPropertyIds={initialPropertyIds}
          isInviting={isInviting}
          onInvite={invite}
          onSuccess={(result) => {
            showToast({
              message: result.authInviteSent
                ? t('members.inviteSent')
                : t('members.invitePendingExisting'),
              type: 'success',
            });
          }}
          onError={(err) => {
            showToast({ message: err.message, type: 'error' });
          }}
        />

        <AppFormSection label={t('members.pendingInvites')}>
          {invites.length === 0 ? (
            <Text className="text-muted-foreground">{t('members.noPending')}</Text>
          ) : (
            invites.map((inviteItem) => (
              <View key={inviteItem.id} style={styles.row} className="border-border">
                <View style={styles.rowText}>
                  <Text className="text-base">{inviteItem.email}</Text>
                  <Text className="text-muted-foreground">
                    {t(`members.roles.${inviteItem.role}`)}
                    {inviteItem.property?.name ? ` · ${inviteItem.property.name}` : ''}
                  </Text>
                </View>
                <Pressable
                  onPress={() => handleRevokeInvite(inviteItem.id, inviteItem.email)}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={t('common.remove')}
                >
                  <Trash2 size={20} color={Colors.danger} strokeWidth={2} />
                </Pressable>
              </View>
            ))
          )}
        </AppFormSection>
      </AppFormScroll>
    </StackScreenChrome>
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
});
