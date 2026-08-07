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
import { displayFontFamily } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { useUiStore } from '@/stores/uiStore';
import { getErrorMessage } from '@/utils/errors';

export default function PropertyMembersScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const { colors, elevation } = theme;
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
        <SkeletonLoader count={4} className="p-4" />
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
  themeName: 'dark' | 'light';
  onRevokeMember: (memberId: string, name: string) => void;
  onRevokeInvite: (inviteId: string, email: string) => void;
}) {
  const { t } = useTranslation();
  const edgeInset = useStackChromeEdgeInset() ?? 0;

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{
        paddingHorizontal: Spacing.gutter,
        paddingTop: edgeInset + Spacing.sm,
        paddingBottom: Spacing.scrollBottom,
      }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Text
        className="text-fg mb-5.5 text-[32px] tracking-[-0.8px]"
        style={{
          fontFamily: displayFontFamily(themeName),
          lineHeight: 32,
        }}
      >
        {t('members.title')}
      </Text>

      <Text
        className="text-fg mb-2.75 text-lg tracking-[-0.36px]"
        style={{ fontFamily: displayFontFamily(themeName) }}
      >
        {t('members.membersSection')}
      </Text>

      {members.length === 0 ? (
        <EmptyState icon={Users} title={t('members.noMembers')} />
      ) : (
        <View
          className="border-card-bd bg-surface rounded-xl border px-4.5 py-1"
          style={[{ borderWidth: StyleSheet.hairlineWidth }, elevation.card]}
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
                className={cn('flex-row items-center gap-3 py-3.5', !isLast && 'border-bd border-b')}
                style={!isLast ? { borderBottomWidth: StyleSheet.hairlineWidth } : undefined}
              >
                <View className="min-w-0 flex-1">
                  <Text
                    className="text-fg font-medium tracking-[-0.15px]"
                    style={{ fontSize: Typography.text.settingsRow.size }}
                  >
                    {name}
                  </Text>
                  <Text
                    className="text-muted mt-0.75"
                    style={{ fontSize: Typography.text.caption.size }}
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
                    className="bg-neg-tint h-8.5 w-8.5 items-center justify-center rounded-full"
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
        className="text-fg mt-5.5 mb-2.75 text-lg tracking-[-0.36px]"
        style={{ fontFamily: displayFontFamily(themeName) }}
      >
        {t('members.pendingInvites')}
      </Text>

      {invites.length === 0 ? (
        <Text className="text-muted mb-4.5 py-1.5 text-[12.5px]">{t('members.noPending')}</Text>
      ) : (
        <View
          className="border-card-bd bg-surface mb-4.5 rounded-xl border px-4.5 py-1"
          style={[{ borderWidth: StyleSheet.hairlineWidth }, elevation.card]}
        >
          {invites.map((inviteItem, index) => {
            const isLast = index === invites.length - 1;
            return (
              <View
                key={inviteItem.id}
                className={cn('flex-row items-center gap-3 py-3.5', !isLast && 'border-bd border-b')}
                style={!isLast ? { borderBottomWidth: StyleSheet.hairlineWidth } : undefined}
              >
                <View className="min-w-0 flex-1">
                  <Text
                    className="text-fg font-medium tracking-[-0.15px]"
                    style={{ fontSize: Typography.text.settingsRow.size }}
                  >
                    {inviteItem.email}
                  </Text>
                  <Text
                    className="text-muted mt-0.75"
                    style={{ fontSize: Typography.text.caption.size }}
                  >
                    {t(`members.roles.${inviteItem.role}`)}
                  </Text>
                </View>
                <Pressable
                  onPress={() => onRevokeInvite(inviteItem.id, inviteItem.email)}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={t('common.remove')}
                  className="bg-neg-tint h-8.5 w-8.5 items-center justify-center rounded-full"
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
        className="bg-primary mt-2 h-[50px] items-center justify-center rounded-full"
      >
        <Text className="text-on-primary text-[15px] font-semibold tracking-[-0.15px]">
          {t('members.invitePeople')}
        </Text>
      </Pressable>
    </ScrollView>
  );
}
