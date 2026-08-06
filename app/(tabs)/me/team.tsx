import { useLocalSearchParams } from 'expo-router';
import { Trash2 } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { InvitePeopleForm } from '@/components/members/InvitePeopleForm';
import { APP_BOTTOM_SHEET_CLOSE_MS } from '@/components/ui/AppBottomSheet';
import { BlurOverlay } from '@/components/ui/BlurOverlay';
import { ErrorState } from '@/components/ui/ErrorState';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { StackScreenChrome, useStackChromeEdgeInset } from '@/components/ui/StackScreenChrome';
import { Spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useMyMemberships, useOwnedPendingInvites } from '@/hooks/useMembers';
import { useProperties } from '@/hooks/useProperties';
import { displayFontFamily, Fonts } from '@/lib/fonts';
import { useUiStore } from '@/stores/uiStore';

export default function TeamAccessScreen() {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const { colors } = theme;
  const { propertyId: propertyIdParam } = useLocalSearchParams<{ propertyId?: string }>();
  const showToast = useUiStore((s) => s.showToast);
  const showConfirmDialog = useUiStore((s) => s.showConfirmDialog);
  const [sheetOpen, setSheetOpen] = useState(false);

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
      <StackScreenChrome title={t('members.teamTitle')} hideHeaderTitle edgeToEdge>
        <SkeletonLoader count={4} style={styles.loader} />
      </StackScreenChrome>
    );
  }

  if (!isOwnerAnywhere) {
    return (
      <StackScreenChrome title={t('members.teamTitle')} hideHeaderTitle edgeToEdge>
        <ErrorState message={t('members.ownersOnly')} />
      </StackScreenChrome>
    );
  }

  if (invitesError) {
    return (
      <StackScreenChrome title={t('members.teamTitle')} hideHeaderTitle edgeToEdge>
        <ErrorState message={invitesError} onRetry={() => void refetchInvites()} />
      </StackScreenChrome>
    );
  }

  return (
    <StackScreenChrome title={t('members.teamTitle')} hideHeaderTitle edgeToEdge>
      <TeamScroll
        colors={colors}
        themeName={theme.name}
        selectableProperties={selectableProperties}
        initialPropertyIds={initialPropertyIds}
        isInviting={isInviting}
        invites={invites}
        invite={invite}
        onRevoke={handleRevokeInvite}
        onSheetVisibilityChange={setSheetOpen}
        onInviteSuccess={(result) => {
          showToast({
            message: result.authInviteSent
              ? t('members.inviteSent')
              : t('members.invitePendingExisting'),
            type: 'success',
          });
        }}
        onInviteError={(err) => {
          showToast({ message: err.message, type: 'error' });
        }}
      />
      <BlurOverlay
        visible={sheetOpen}
        intensity="strong"
        tint="dark"
        duration={APP_BOTTOM_SHEET_CLOSE_MS}
        zIndex={5}
      />
    </StackScreenChrome>
  );
}

function TeamScroll({
  colors,
  themeName,
  selectableProperties,
  initialPropertyIds,
  isInviting,
  invites,
  invite,
  onRevoke,
  onSheetVisibilityChange,
  onInviteSuccess,
  onInviteError,
}: {
  colors: ReturnType<typeof useAppTheme>['theme']['colors'];
  themeName: 'dark' | 'light';
  selectableProperties: ReturnType<typeof useProperties>['properties'];
  initialPropertyIds: string[];
  isInviting: boolean;
  invites: ReturnType<typeof useOwnedPendingInvites>['invites'];
  invite: ReturnType<typeof useOwnedPendingInvites>['invite'];
  onRevoke: (inviteId: string, email: string) => void;
  onSheetVisibilityChange: (open: boolean) => void;
  onInviteSuccess: Parameters<typeof InvitePeopleForm>[0]['onSuccess'];
  onInviteError: Parameters<typeof InvitePeopleForm>[0]['onError'];
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
          marginBottom: 24,
        }}
      >
        {t('members.teamTitle')}
      </Text>

      <InvitePeopleForm
        properties={selectableProperties}
        initialPropertyIds={initialPropertyIds}
        isInviting={isInviting}
        onInvite={invite}
        onSheetVisibilityChange={onSheetVisibilityChange}
        onSuccess={onInviteSuccess}
        onError={onInviteError}
      />

      <Text
        style={{
          fontFamily: displayFontFamily(themeName),
          fontSize: 18,
          letterSpacing: -0.36,
          color: colors.fg,
          marginTop: 28,
          marginBottom: 4,
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
            paddingVertical: 10,
          }}
        >
          {t('members.noPending')}
        </Text>
      ) : (
        invites.map((inviteItem) => (
          <View
            key={inviteItem.id}
            style={[styles.row, { borderBottomColor: colors.bd }]}
          >
            <View style={styles.rowText}>
              <Text
                style={{
                  fontFamily: Fonts.sans.medium,
                  fontSize: 14,
                  color: colors.fg,
                }}
              >
                {inviteItem.email}
              </Text>
              <Text
                style={{
                  fontFamily: Fonts.sans.regular,
                  fontSize: 12,
                  color: colors.muted,
                  marginTop: 2,
                }}
              >
                {t(`members.roles.${inviteItem.role}`)}
                {inviteItem.property?.name ? ` · ${inviteItem.property.name}` : ''}
              </Text>
            </View>
            <Pressable
              onPress={() => onRevoke(inviteItem.id, inviteItem.email)}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={t('common.remove')}
            >
              <Trash2 size={20} color={colors.neg} strokeWidth={2} />
            </Pressable>
          </View>
        ))
      )}
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowText: {
    flex: 1,
  },
});
