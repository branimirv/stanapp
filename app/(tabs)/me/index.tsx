import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { router, Stack, useFocusEffect } from 'expo-router';
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
import { useCallback, useMemo, useState } from 'react';
import {
  Linking,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { APP_BOTTOM_SHEET_CLOSE_MS } from '@/components/ui/AppBottomSheet';
import { BlurOverlay } from '@/components/ui/BlurOverlay';
import { ErrorState } from '@/components/ui/ErrorState';
import { FloatingScreenActions } from '@/components/ui/FloatingScreenActions';
import { HeaderBtnIco } from '@/components/ui/HeaderActionsPill';
import {
  SettingsGroup,
  SettingsOptionSheet,
  SettingsRow,
} from '@/components/ui/SettingsList';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { THEMES } from '@/constants/config';
import { HEADER_ACTION_SLOT, HEADER_ICON_SIZE, tabRootScreenOptions } from '@/constants/header';
import { Spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useMyMemberships } from '@/hooks/useMembers';
import { useProfile } from '@/hooks/useProfile';
import { useProperties } from '@/hooks/useProperties';
import { useTabBarPreference, type TabBarLabelMode } from '@/hooks/useTabBarPreference';
import { useTenants } from '@/hooks/useTenants';
import i18n from '@/i18n';
import { displayFontFamily } from '@/lib/fonts';
import { useAuthStore } from '@/stores/authStore';
import { useTabBarStore } from '@/stores/tabBarStore';
import { useUiStore } from '@/stores/uiStore';
import type { Language, Theme } from '@/types/app.types';
import { getInitialsFromFullName } from '@/utils/avatar';
import { exportAllDataCSV } from '@/utils/export';
import { loadNotificationPreferences } from '@/utils/notificationPreferences';

type PickerKind = 'language' | 'theme' | 'tabBar' | null;

const THEME_LABELS: Record<Theme, string> = {
  light: 'settings.themeLight',
  dark: 'settings.themeDark',
  system: 'settings.themeSystem',
};

const TAB_BAR_LABELS: Record<TabBarLabelMode, string> = {
  iconAndLabel: 'settings.tabBarIconAndLabel',
  iconOnly: 'settings.tabBarIconOnly',
};

function splitDisplayName(fullName: string): { first: string; rest: string | null } {
  const trimmed = fullName.trim();
  const space = trimmed.indexOf(' ');
  if (space <= 0) return { first: trimmed, rest: null };
  return {
    first: trimmed.slice(0, space),
    rest: trimmed.slice(space + 1).trim() || null,
  };
}

export default function MeScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { theme, preference, setPreference } = useAppTheme();
  const { colors, elevation } = theme;
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const showToast = useUiStore((s) => s.showToast);
  const showConfirmDialog = useUiStore((s) => s.showConfirmDialog);
  const setChromeHidden = useTabBarStore((s) => s.setChromeHidden);
  const { labelMode, setLabelMode } = useTabBarPreference();

  const {
    profile,
    isLoading,
    error,
    refetch: refetchProfile,
    updateLanguage,
    updateTheme,
  } = useProfile();
  const { properties, refetch: refetchProperties } = useProperties();
  const { tenants, refetch: refetchTenants } = useTenants();
  const { memberships } = useMyMemberships();
  const ownsAnyProperty = useMemo(
    () => memberships.some((membership) => membership.role === 'owner'),
    [memberships],
  );

  const [isExporting, setIsExporting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [notificationsEnabledCount, setNotificationsEnabledCount] = useState(0);
  const [activePicker, setActivePicker] = useState<PickerKind>(null);

  const openPicker = useCallback(
    (kind: PickerKind) => {
      setActivePicker(kind);
      setChromeHidden(true);
    },
    [setChromeHidden],
  );

  const closePicker = useCallback(() => {
    setActivePicker(null);
    setChromeHidden(false);
  }, [setChromeHidden]);

  useFocusEffect(
    useCallback(() => {
      void loadNotificationPreferences().then((prefs) => {
        const count = [
          prefs.dueDateReminders,
          prefs.overdueAlerts,
          prefs.contractReminders,
        ].filter(Boolean).length;
        setNotificationsEnabledCount(count);
      });
    }, []),
  );

  const handleLanguageChange = useCallback(
    async (language: Language) => {
      try {
        await updateLanguage(language);
        await i18n.changeLanguage(language);
        await AsyncStorage.setItem('@stanapp/language', language);
        showToast({ message: t('settings.languageUpdated'), type: 'success' });
      } catch (err) {
        showToast({
          message: err instanceof Error ? err.message : t('settings.saveFailed'),
          type: 'error',
        });
      }
    },
    [showToast, t, updateLanguage],
  );

  const handleThemeChange = useCallback(
    async (nextTheme: Theme) => {
      try {
        await setPreference(nextTheme);
        await updateTheme(nextTheme);
        showToast({ message: t('settings.themeUpdated'), type: 'success' });
      } catch (err) {
        showToast({
          message: err instanceof Error ? err.message : t('settings.saveFailed'),
          type: 'error',
        });
      }
    },
    [setPreference, showToast, t, updateTheme],
  );

  const handleTabBarChange = useCallback(
    async (mode: TabBarLabelMode) => {
      await setLabelMode(mode);
      showToast({ message: t('settings.tabBarStyleUpdated'), type: 'success' });
    },
    [setLabelMode, showToast, t],
  );

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    try {
      await exportAllDataCSV(t);
      showToast({ message: t('settings.exportDataSuccess'), type: 'success' });
    } catch (err) {
      showToast({
        message: err instanceof Error ? err.message : t('settings.exportDataFailed'),
        type: 'error',
      });
    } finally {
      setIsExporting(false);
    }
  }, [showToast, t]);

  const handleSignOut = useCallback(() => {
    showConfirmDialog({
      title: t('confirm.signOutTitle'),
      message: t('confirm.signOutMessage'),
      confirmLabel: t('auth.signOut'),
      destructive: true,
      icon: 'logOut',
      onConfirm: async () => {
        const { error: signOutError } = await signOut();
        if (signOutError) {
          showToast({ message: signOutError.message, type: 'error' });
          return;
        }
        showToast({ message: t('auth.signOutSuccess'), type: 'success' });
      },
    });
  }, [showConfirmDialog, showToast, signOut, t]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchProfile(), refetchProperties(), refetchTenants()]);
    setRefreshing(false);
  }, [refetchProfile, refetchProperties, refetchTenants]);

  const language = profile?.language ?? 'hr';
  const fullName = profile?.full_name?.trim() || t('tabs.me');
  const nameParts = splitDisplayName(fullName);
  const initials = getInitialsFromFullName(fullName);

  const objectCount = useMemo(
    () => properties.filter((p) => p.parent_property_id == null).length,
    [properties],
  );
  const unitCount = properties.length;
  const contractCount = useMemo(
    () => tenants.filter((tenant) => tenant.is_active).length,
    [tenants],
  );

  const languageLabel = useMemo(
    () =>
      language === 'en' ? t('settings.languageEnglish') : t('settings.languageCroatian'),
    [language, t],
  );

  const notificationsBadge =
    notificationsEnabledCount > 0
      ? t('settings.notificationsOnCount', { count: notificationsEnabledCount })
      : t('common.off');

  const versionLabel = Constants.expoConfig?.version ?? '1.0.0';
  const pickerOpen = activePicker != null;

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={tabRootScreenOptions(t('tabs.me'))} />
        <SkeletonLoader count={8} className="p-4" />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Stack.Screen options={tabRootScreenOptions(t('tabs.me'))} />
        <ErrorState message={error} onRetry={refetchProfile} />
      </>
    );
  }

  return (
    <View className="flex-1 bg-transparent" collapsable={false}>
        <Stack.Screen options={tabRootScreenOptions(t('settings.profile'))} />

      <ScrollView
        className="flex-1"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: theme.spacing.gutter,
          paddingTop: Platform.OS === 'ios' ? Spacing.sm : insets.top + Spacing.sm,
          paddingBottom: Spacing.scrollBottom,
        }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        <View
          className="flex-row items-center justify-between py-4"
          style={{ minHeight: HEADER_ACTION_SLOT + 32 }}
        >
          <Text className="text-muted flex-1 text-[11px] leading-3.5 font-semibold tracking-[1.54px] uppercase">
            {t('settings.profile')}
          </Text>
          <View style={{ width: HEADER_ACTION_SLOT, height: HEADER_ACTION_SLOT }} />
        </View>

        <View className="mb-5">
          <View className="flex-row items-start gap-3.5">
            <View className="min-w-0 flex-1">
              <Text
                className="text-fg text-[32px] tracking-[-0.8px]"
                style={{
                  fontFamily: displayFontFamily(theme.name),
                  lineHeight: 34.5,
                }}
              >
                {nameParts.first}
                {nameParts.rest ? `\n${nameParts.rest}` : ''}
              </Text>
              {user?.email ? (
                <Text className="text-muted mt-2.5 text-[12.5px]" numberOfLines={1}>
                  {user.email}
                </Text>
              ) : null}
            </View>
            <View className="bg-primary-tint h-[58px] w-[58px] items-center justify-center rounded-full">
              <Text
                className="text-primary text-[21px]"
                style={{ fontFamily: displayFontFamily(theme.name) }}
              >
                {initials}
              </Text>
            </View>
          </View>
        </View>

        <View
          className="border-card-bd bg-surface mb-5.5 flex-row overflow-hidden rounded-xl border"
          style={[{ borderWidth: StyleSheet.hairlineWidth }, elevation.card]}
        >
          {(
            [
              { label: t('settings.objectsBay'), value: objectCount },
              { label: t('settings.unitsBay'), value: unitCount },
              { label: t('settings.contractsBay'), value: contractCount },
            ] as const
          ).map((bay, index) => (
            <View key={bay.label} className="flex-1 flex-row">
              {index > 0 ? (
                <View className="bg-bd" style={{ width: StyleSheet.hairlineWidth }} />
              ) : null}
              <View className="flex-1 px-3.5 py-4">
                <Text className="text-muted mb-2.25 text-[10px] font-semibold tracking-[0.8px] uppercase">
                  {bay.label}
                </Text>
                <Text
                  className="text-fg text-[21px] tracking-[-0.42px]"
                  style={{ fontFamily: displayFontFamily(theme.name) }}
                >
                  {bay.value}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <SettingsGroup title={t('settings.account')}>
          <SettingsRow
            icon={Pencil}
            label={t('settings.editProfile')}
            onPress={() => router.push('/(tabs)/me/profile')}
          />
          {ownsAnyProperty ? (
            <SettingsRow
              icon={Users}
              label={t('members.teamTitle')}
              subtitle={t('members.teamHint')}
              onPress={() => router.push('/(tabs)/me/team')}
            />
          ) : null}
        </SettingsGroup>

        <SettingsGroup title={t('settings.title')} className="mb-4">
          <SettingsRow
            icon={Moon}
            label={t('settings.appearance')}
            value={t(THEME_LABELS[preference])}
            onPress={() => openPicker('theme')}
          />
          <SettingsRow
            icon={Globe}
            label={t('settings.language')}
            value={languageLabel}
            onPress={() => openPicker('language')}
          />
          <SettingsRow
            icon={Bell}
            label={t('settings.notifications')}
            badge={notificationsBadge}
            badgeTone={notificationsEnabledCount > 0 ? 'accent' : 'muted'}
            onPress={() => router.push('/(tabs)/me/notifications')}
          />
          <SettingsRow
            icon={LayoutGrid}
            label={t('settings.tabBarStyle')}
            value={t(TAB_BAR_LABELS[labelMode])}
            onPress={() => openPicker('tabBar')}
          />
          <SettingsRow
            icon={Download}
            label={t('settings.exportData')}
            loading={isExporting}
            showChevron={false}
            onPress={handleExport}
          />
          <SettingsRow
            icon={Shield}
            label={t('settings.privacySecurity')}
            onPress={() => Linking.openURL('https://stanapp.app/privacy')}
          />
        </SettingsGroup>

        <Pressable
          onPress={handleSignOut}
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
      </ScrollView>

      <FloatingScreenActions align="right">
        <HeaderBtnIco
          onPress={() => router.push('/(tabs)/me/notifications')}
          accessibilityLabel={t('settings.notifications')}
        >
          <Bell size={HEADER_ICON_SIZE} color={colors.fg} strokeWidth={2} />
        </HeaderBtnIco>
      </FloatingScreenActions>

      <BlurOverlay
        visible={pickerOpen}
        intensity="strong"
        tint="dark"
        duration={APP_BOTTOM_SHEET_CLOSE_MS}
        zIndex={5}
      />

      <SettingsOptionSheet<Language>
        visible={activePicker === 'language'}
        title={t('settings.language')}
        value={language}
        options={[
          { value: 'en', label: t('settings.languageEnglish') },
          { value: 'hr', label: t('settings.languageCroatian') },
        ]}
        onSelect={handleLanguageChange}
        onClose={closePicker}
      />

      <SettingsOptionSheet<Theme>
        visible={activePicker === 'theme'}
        title={t('settings.appearance')}
        value={preference}
        options={THEMES.map((item) => ({
          value: item,
          label: t(THEME_LABELS[item]),
        }))}
        onSelect={handleThemeChange}
        onClose={closePicker}
      />

      <SettingsOptionSheet<TabBarLabelMode>
        visible={activePicker === 'tabBar'}
        title={t('settings.tabBarStyle')}
        value={labelMode}
        options={[
          { value: 'iconAndLabel', label: t('settings.tabBarIconAndLabel') },
          { value: 'iconOnly', label: t('settings.tabBarIconOnly') },
        ]}
        onSelect={handleTabBarChange}
        onClose={closePicker}
      />
    </View>
  );
}

