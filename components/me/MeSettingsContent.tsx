import {
  Bell,
  Download,
  Globe,
  LayoutGrid,
  LogOut,
  Moon,
  Pencil,
  Shield,
  Users,
} from 'lucide-react-native';
import { Pressable, Text } from 'react-native';
import { useTranslation } from 'react-i18next';

import {
  SettingsGroup,
  SettingsRow,
} from '@/components/ui/SettingsList';
import { useAppTheme } from '@/hooks/useAppTheme';

type MeSettingsContentProps = {
  ownsAnyProperty: boolean;
  appearanceValue: string;
  languageValue: string;
  notificationsBadge: string;
  notificationsEnabled: boolean;
  tabBarValue: string;
  isExporting: boolean;
  versionLabel: string;
  onEditProfile: () => void;
  onOpenTeam: () => void;
  onOpenAppearance: () => void;
  onOpenLanguage: () => void;
  onOpenNotifications: () => void;
  onOpenTabBar: () => void;
  onExport: () => void;
  onOpenPrivacy: () => void;
  onSignOut: () => void;
};

/** Account + preferences rows, sign-out control, and version footer. */
export function MeSettingsContent({
  ownsAnyProperty,
  appearanceValue,
  languageValue,
  notificationsBadge,
  notificationsEnabled,
  tabBarValue,
  isExporting,
  versionLabel,
  onEditProfile,
  onOpenTeam,
  onOpenAppearance,
  onOpenLanguage,
  onOpenNotifications,
  onOpenTabBar,
  onExport,
  onOpenPrivacy,
  onSignOut,
}: MeSettingsContentProps) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const { colors } = theme;

  return (
    <>
      <SettingsGroup title={t('settings.account')}>
        <SettingsRow
          icon={Pencil}
          label={t('settings.editProfile')}
          onPress={onEditProfile}
        />
        {ownsAnyProperty ? (
          <SettingsRow
            icon={Users}
            label={t('members.teamTitle')}
            subtitle={t('members.teamHint')}
            onPress={onOpenTeam}
          />
        ) : null}
      </SettingsGroup>

      <SettingsGroup title={t('settings.title')} className="mb-4">
        <SettingsRow
          icon={Moon}
          label={t('settings.appearance')}
          value={appearanceValue}
          onPress={onOpenAppearance}
        />
        <SettingsRow
          icon={Globe}
          label={t('settings.language')}
          value={languageValue}
          onPress={onOpenLanguage}
        />
        <SettingsRow
          icon={Bell}
          label={t('settings.notifications')}
          badge={notificationsBadge}
          badgeTone={notificationsEnabled ? 'accent' : 'muted'}
          onPress={onOpenNotifications}
        />
        <SettingsRow
          icon={LayoutGrid}
          label={t('settings.tabBarStyle')}
          value={tabBarValue}
          onPress={onOpenTabBar}
        />
        <SettingsRow
          icon={Download}
          label={t('settings.exportData')}
          loading={isExporting}
          showChevron={false}
          onPress={onExport}
        />
        <SettingsRow
          icon={Shield}
          label={t('settings.privacySecurity')}
          onPress={onOpenPrivacy}
        />
      </SettingsGroup>

      <Pressable
        onPress={onSignOut}
        accessibilityRole="button"
        accessibilityLabel={t('settings.signOut')}
        className="bg-surface-2 h-12 flex-row items-center justify-center gap-2 rounded-full"
      >
        <LogOut size={18} color={colors.neg} strokeWidth={2} />
        <Text className="text-neg text-sm font-semibold tracking-[-0.14px]">
          {t('settings.signOut')}
        </Text>
      </Pressable>

      <Text className="text-muted mt-4 text-center text-[10px] font-semibold tracking-[0.8px] uppercase">
        {t('settings.version')} {versionLabel}
      </Text>
    </>
  );
}
