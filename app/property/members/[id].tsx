import { router, useLocalSearchParams } from 'expo-router';
import { Trash2, Users } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { StackScreenChrome, useStackChromeEdgeInset } from '@/components/ui/StackScreenChrome';
import { Spacing, Typography } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useMyMembership, usePropertyInvites, usePropertyMembers } from '@/hooks/useMembers';
import { useProperty } from '@/hooks/useProperties';
import { displayFontFamily, Fonts } from '@/lib/fonts';
import { useAuthStore } from '@/stores/authStore';
import { useUiStore } from '@/stores/uiStore';
import { getErrorMessage } from '@/utils/errors';

export default function PropertyMembersScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const { colors, elevation, radius } = theme;
  const showToast = useUiStore((s) => s.showToast);
  const showConfirmDialog = useUiStore((s) => s.showConfirmDialog);
  const user = useAuthStore((s) => s.user);

  const { isOwner, isLoading: membershipLoading } = useMyMembership(id);
  const { property } = useProperty(id);
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

  const primaryOwnerId = property?.user_id;
  const activeOwnerCount = members.filter((m) => m.role === 'owner').length;

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
            message: getErrorMessage(err, t('members.memberRemoveFailed')),
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
      <StackScreenChrome title={t('members.title')} hideHeaderTitle edgeToEdge>
        <SkeletonLoader count={4} style={styles.loader} />
      </StackScreenChrome>
    );
  }

  if (!isOwner) {
    return (
      <StackScreenChrome title={t('members.title')} hideHeaderTitle edgeToEdge>
        <ErrorState message={t('members.ownersOnly')} onRetry={() => router.back()} />
      </StackScreenChrome>
    );
  }

  if (membersError || invitesError) {
    return (
      <StackScreenChrome title={t('members.title')} hideHeaderTitle edgeToEdge>
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
    <StackScreenChrome title={t('members.title')} hideHeaderTitle edgeToEdge>
      <MembersBody
        members={members}
        invites={invites}
        userId={user?.id}
        primaryOwnerId={primaryOwnerId}
        activeOwnerCount={activeOwnerCount}
        propertyId={id}
        colors={colors}
        elevation={elevation}
        radius={radius}
        themeName={theme.name}
        onRevokeMember={handleRevokeMember}
        onRevokeInvite={handleRevokeInvite}
      />
    </StackScreenChrome>
  );
}

function MembersBody({
  members,
  invites,
  userId,
  primaryOwnerId,
  activeOwnerCount,
  propertyId,
  colors,
  elevation,
  radius,
  themeName,
  onRevokeMember,
  onRevokeInvite,
}: {
  members: ReturnType<typeof usePropertyMembers>['members'];
  invites: ReturnType<typeof usePropertyInvites>['invites'];
  userId?: string;
  primaryOwnerId?: string;
  activeOwnerCount: number;
  propertyId?: string;
  colors: ReturnType<typeof useAppTheme>['theme']['colors'];
  elevation: ReturnType<typeof useAppTheme>['theme']['elevation'];
  radius: ReturnType<typeof useAppTheme>['theme']['radius'];
  themeName: 'dark' | 'light';
  onRevokeMember: (memberId: string, name: string) => void;
  onRevokeInvite: (inviteId: string, email: string) => void;
}) {
  const { t } = useTranslation();
  const edgeInset = useStackChromeEdgeInset() ?? 0;

  return (
      <ScrollView
        style={styles.flex}
        contentContainerStyle={{
          paddingHorizontal: Spacing.gutter,
          paddingTop: edgeInset + Spacing.sm,
          paddingBottom: Spacing.scrollBottom,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={{
            fontFamily: displayFontFamily(themeName),
            fontSize: 32,
            lineHeight: 32,
            letterSpacing: -0.8,
            color: colors.fg,
            marginBottom: 22,
          }}
        >
          {t('members.title')}
        </Text>

        <Text
          style={{
            fontFamily: displayFontFamily(themeName),
            fontSize: 18,
            letterSpacing: -0.36,
            color: colors.fg,
            marginBottom: 11,
          }}
        >
          {t('members.membersSection')}
        </Text>

        {members.length === 0 ? (
          <EmptyState icon={Users} title={t('members.noMembers')} />
        ) : (
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.surface,
                borderColor: colors.cardBd,
                borderRadius: radius.xl,
                ...elevation.card,
              },
            ]}
          >
            {members.map((member, index) => {
              const name = member.profile?.full_name ?? t('members.unknownUser');
              const isSelf = member.user_id === userId;
              const isPrimaryOwner = primaryOwnerId != null && member.user_id === primaryOwnerId;
              const isLastOwner = member.role === 'owner' && activeOwnerCount <= 1;
              const canRevoke = !isSelf && !isPrimaryOwner && !isLastOwner;
              const isLast = index === members.length - 1;
              return (
                <View
                  key={member.id}
                  style={[
                    styles.row,
                    !isLast
                      ? {
                          borderBottomWidth: StyleSheet.hairlineWidth,
                          borderBottomColor: colors.bd,
                        }
                      : null,
                  ]}
                >
                  <View style={styles.rowText}>
                    <Text
                      style={{
                        fontFamily: Fonts.sans.medium,
                        fontSize: Typography.text.settingsRow.size,
                        letterSpacing: -0.15,
                        color: colors.fg,
                      }}
                    >
                      {name}
                    </Text>
                    <Text
                      style={{
                        fontFamily: Fonts.sans.regular,
                        fontSize: Typography.text.caption.size,
                        color: colors.muted,
                        marginTop: 3,
                      }}
                    >
                      {t(`members.roles.${member.role}`)}
                      {isSelf ? ` · ${t('members.you')}` : ''}
                      {isPrimaryOwner ? ` · ${t('members.primaryOwner')}` : ''}
                    </Text>
                  </View>
                  {canRevoke ? (
                    <Pressable
                      onPress={() => onRevokeMember(member.id, name)}
                      hitSlop={8}
                      accessibilityRole="button"
                      accessibilityLabel={t('common.remove')}
                      style={[styles.iconBtn, { backgroundColor: colors.negTint }]}
                    >
                      <Trash2 size={16} color={colors.neg} strokeWidth={2} />
                    </Pressable>
                  ) : null}
                </View>
              );
            })}
          </View>
        )}

        <Text
          style={{
            fontFamily: displayFontFamily(themeName),
            fontSize: 18,
            letterSpacing: -0.36,
            color: colors.fg,
            marginTop: 22,
            marginBottom: 11,
          }}
        >
          {t('members.pendingInvites')}
        </Text>

        {invites.length === 0 ? (
          <Text
            style={{
              fontFamily: Fonts.sans.regular,
              fontSize: 12.5,
              color: colors.muted,
              paddingVertical: 6,
              marginBottom: 18,
            }}
          >
            {t('members.noPending')}
          </Text>
        ) : (
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.surface,
                borderColor: colors.cardBd,
                borderRadius: radius.xl,
                ...elevation.card,
                marginBottom: 18,
              },
            ]}
          >
            {invites.map((inviteItem, index) => {
              const isLast = index === invites.length - 1;
              return (
                <View
                  key={inviteItem.id}
                  style={[
                    styles.row,
                    !isLast
                      ? {
                          borderBottomWidth: StyleSheet.hairlineWidth,
                          borderBottomColor: colors.bd,
                        }
                      : null,
                  ]}
                >
                  <View style={styles.rowText}>
                    <Text
                      style={{
                        fontFamily: Fonts.sans.medium,
                        fontSize: Typography.text.settingsRow.size,
                        letterSpacing: -0.15,
                        color: colors.fg,
                      }}
                    >
                      {inviteItem.email}
                    </Text>
                    <Text
                      style={{
                        fontFamily: Fonts.sans.regular,
                        fontSize: Typography.text.caption.size,
                        color: colors.muted,
                        marginTop: 3,
                      }}
                    >
                      {t(`members.roles.${inviteItem.role}`)}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => onRevokeInvite(inviteItem.id, inviteItem.email)}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel={t('common.remove')}
                    style={[styles.iconBtn, { backgroundColor: colors.negTint }]}
                  >
                    <Trash2 size={16} color={colors.neg} strokeWidth={2} />
                  </Pressable>
                </View>
              );
            })}
          </View>
        )}

        <Pressable
          onPress={() =>
            router.push({
              pathname: '/(tabs)/me/team',
              params: propertyId ? { propertyId } : undefined,
            })
          }
          accessibilityRole="button"
          accessibilityLabel={t('members.invitePeople')}
          style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
        >
          <Text
            style={{
              fontFamily: Fonts.sans.semibold,
              fontSize: 15,
              letterSpacing: -0.15,
              color: colors.onPrimary,
            }}
          >
            {t('members.invitePeople')}
          </Text>
        </Pressable>
      </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  loader: {
    padding: Spacing.md,
  },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 18,
    paddingVertical: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
  },
  rowText: {
    flex: 1,
    minWidth: 0,
  },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtn: {
    height: 50,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
});
