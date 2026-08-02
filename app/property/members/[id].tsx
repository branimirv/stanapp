import { router, useLocalSearchParams } from 'expo-router';
import { Trash2 } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppButton } from '@/components/ui/AppButton';
import { AppFormScroll, AppFormSection } from '@/components/ui/AppFormScroll';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { StackScreenChrome } from '@/components/ui/StackScreenChrome';
import { Text } from '@/components/ui/text';
import { Colors, Spacing } from '@/constants/theme';
import { useMyMembership, usePropertyInvites, usePropertyMembers } from '@/hooks/useMembers';
import { useAuthStore } from '@/stores/authStore';
import { useUiStore } from '@/stores/uiStore';

export default function PropertyMembersScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const showToast = useUiStore((s) => s.showToast);
  const showConfirmDialog = useUiStore((s) => s.showConfirmDialog);
  const user = useAuthStore((s) => s.user);

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
    revoke: revokeInvite,
  } = usePropertyInvites(id);

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
      <StackScreenChrome title={t('members.title')}>
        <SkeletonLoader count={4} style={styles.loader} />
      </StackScreenChrome>
    );
  }

  if (!isOwner) {
    return (
      <StackScreenChrome title={t('members.title')}>
        <ErrorState message={t('members.ownersOnly')} onRetry={() => router.back()} />
      </StackScreenChrome>
    );
  }

  if (membersError || invitesError) {
    return (
      <StackScreenChrome title={t('members.title')}>
        <ErrorState
          message={membersError ?? invitesError ?? t('members.loadFailed')}
          onRetry={() => {
            void refetchMembers();
            void refetchInvites();
          }}
        />
      </StackScreenChrome>
    );
  }

  return (
    <StackScreenChrome title={t('members.title')}>
      <AppFormScroll>
        <AppFormSection label={t('members.membersSection')}>
          {members.length === 0 ? (
            <EmptyState title={t('members.noMembers')} />
          ) : (
            members.map((member) => {
              const name = member.profile?.full_name ?? t('members.unknownUser');
              const isSelf = member.user_id === user?.id;
              return (
                <View key={member.id} style={styles.row} className="border-border">
                  <View style={styles.rowText}>
                    <Text className="text-base">{name}</Text>
                    <Text className="text-muted-foreground">
                      {t(`members.roles.${member.role}`)}
                      {isSelf ? ` · ${t('members.you')}` : ''}
                    </Text>
                  </View>
                  {!isSelf ? (
                    <Pressable
                      onPress={() => handleRevokeMember(member.id, name)}
                      hitSlop={8}
                      accessibilityRole="button"
                      accessibilityLabel={t('common.remove')}
                    >
                      <Trash2 size={20} color={Colors.danger} strokeWidth={2} />
                    </Pressable>
                  ) : null}
                </View>
              );
            })
          )}
        </AppFormSection>

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

        <AppButton
          mode="contained"
          onPress={() =>
            router.push({
              pathname: '/(tabs)/me/team',
              params: id ? { propertyId: id } : undefined,
            })
          }
        >
          {t('members.invitePeople')}
        </AppButton>
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
