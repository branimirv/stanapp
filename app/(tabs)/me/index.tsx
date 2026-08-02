import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { router, Stack, useFocusEffect } from 'expo-router';
import {
  Bell,
  Coins,
  Download,
  FileText,
  Globe,
  LayoutGrid,
  LogOut,
  Moon,
  Shield,
  User,
  Users,
} from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import { Linking, Platform, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { ErrorState } from '@/components/ui/ErrorState';
import {
  SettingsGroup,
  SettingsOptionSheet,
  SettingsRow,
} from '@/components/ui/SettingsList';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { Text } from '@/components/ui/text';
import { SUPPORTED_CURRENCIES, THEMES } from '@/constants/config';
import { tabRootScreenOptions } from '@/constants/header';
import { Spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useMyMemberships } from '@/hooks/useMembers';
import { useProfile } from '@/hooks/useProfile';
import { useTabBarPreference, type TabBarLabelMode } from '@/hooks/useTabBarPreference';
import i18n from '@/i18n';
import { signOut } from '@/lib/auth';
import { useAuthStore } from '@/stores/authStore';
import { useUiStore } from '@/stores/uiStore';
import type { Language, Theme } from '@/types/app.types';
import { exportAllDataCSV } from '@/utils/export';
import { loadNotificationPreferences } from '@/utils/notificationPreferences';

type PickerKind = 'language' | 'currency' | 'theme' | 'tabBar' | null;

const THEME_LABELS: Record<Theme, string> = {
  light: 'settings.themeLight',
  dark: 'settings.themeDark',
  system: 'settings.themeSystem',
};

const TAB_BAR_LABELS: Record<TabBarLabelMode, string> = {
  iconAndLabel: 'settings.tabBarIconAndLabel',
  iconOnly: 'settings.tabBarIconOnly',
};

export default function MeScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const showToast = useUiStore((s) => s.showToast);
  const showConfirmDialog = useUiStore((s) => s.showConfirmDialog);
  const { preference, setPreference } = useAppTheme();
  const { labelMode, setLabelMode } = useTabBarPreference();

  const {
    profile,
    isLoading,
    error,
    refetch,
    updateLanguage,
    updateCurrency,
    updateTheme,
  } = useProfile();
  const { memberships } = useMyMemberships();
  const ownsAnyProperty = useMemo(
    () => memberships.some((membership) => membership.role === 'owner'),
    [memberships],
  );

  const [isExporting, setIsExporting] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [activePicker, setActivePicker] = useState<PickerKind>(null);

  useFocusEffect(
    useCallback(() => {
      void loadNotificationPreferences().then((prefs) => {
        setNotificationsEnabled(
          prefs.dueDateReminders || prefs.overdueAlerts || prefs.contractReminders,
        );
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

  const handleCurrencyChange = useCallback(
    async (currency: string) => {
      try {
        await updateCurrency(currency);
        showToast({ message: t('settings.currencyUpdated'), type: 'success' });
      } catch (err) {
        showToast({
          message: err instanceof Error ? err.message : t('settings.saveFailed'),
          type: 'error',
        });
      }
    },
    [showToast, t, updateCurrency],
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
      onConfirm: async () => {
        const { error: signOutError } = await signOut();
        if (signOutError) {
          showToast({ message: signOutError.message, type: 'error' });
          return;
        }
        showToast({ message: t('auth.signOutSuccess'), type: 'success' });
        router.replace('/(auth)/login');
      },
    });
  }, [showConfirmDialog, showToast, t]);

  const language = profile?.language ?? 'hr';
  const currency = profile?.default_currency ?? 'EUR';

  const languageLabel = useMemo(
    () =>
      language === 'en' ? t('settings.languageEnglish') : t('settings.languageCroatian'),
    [language, t],
  );

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
        <ErrorState message={error} onRetry={refetch} />
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={tabRootScreenOptions(t('tabs.me'))} />

      <ScrollView
        className="bg-transparent"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="gap-6 px-4 pb-12"
        contentContainerStyle={{
          // iOS automatic content inset covers the status bar; Android needs it manually.
          paddingTop: Platform.OS === 'ios' ? Spacing.sm : insets.top + Spacing.sm,
        }}
      >
        <View className="gap-1 px-1">
          <Text className="text-2xl font-bold tracking-tight">
            {profile?.full_name || t('tabs.me')}
          </Text>
          {user?.email ? (
            <Text className="text-muted-foreground text-sm">{user.email}</Text>
          ) : null}
        </View>

        <SettingsGroup title={t('settings.account')}>
          <SettingsRow
            icon={User}
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

        <SettingsGroup title={t('settings.title')}>
          <SettingsRow
            icon={Globe}
            label={t('settings.language')}
            value={languageLabel}
            onPress={() => setActivePicker('language')}
          />
          <SettingsRow
            icon={Coins}
            label={t('settings.currency')}
            value={currency}
            onPress={() => setActivePicker('currency')}
          />
          <SettingsRow
            icon={Moon}
            label={t('settings.appearance')}
            value={t(THEME_LABELS[preference])}
            onPress={() => setActivePicker('theme')}
          />
          <SettingsRow
            icon={LayoutGrid}
            label={t('settings.tabBarStyle')}
            value={t(TAB_BAR_LABELS[labelMode])}
            onPress={() => setActivePicker('tabBar')}
          />
          <SettingsRow
            icon={Bell}
            label={t('settings.notifications')}
            badge={notificationsEnabled ? t('common.on') : t('common.off')}
            badgeTone={notificationsEnabled ? 'accent' : 'muted'}
            onPress={() => router.push('/(tabs)/me/notifications')}
          />
        </SettingsGroup>

        <SettingsGroup title={t('settings.data')}>
          <SettingsRow
            icon={Download}
            label={t('settings.exportData')}
            subtitle={t('settings.exportDataHint')}
            loading={isExporting}
            showChevron={false}
            onPress={handleExport}
          />
        </SettingsGroup>

        <SettingsGroup title={t('settings.about')}>
          <SettingsRow
            icon={FileText}
            label={t('settings.version')}
            value={Constants.expoConfig?.version ?? '1.0.0'}
            showChevron={false}
          />
          <SettingsRow
            icon={Shield}
            label={t('settings.privacyPolicy')}
            onPress={() => Linking.openURL('https://stanapp.app/privacy')}
          />
          <SettingsRow
            icon={FileText}
            label={t('settings.termsOfService')}
            onPress={() => Linking.openURL('https://stanapp.app/terms')}
          />
        </SettingsGroup>

        <SettingsGroup>
          <SettingsRow
            icon={LogOut}
            label={t('settings.signOut')}
            destructive
            showChevron={false}
            onPress={handleSignOut}
          />
        </SettingsGroup>
      </ScrollView>

      <SettingsOptionSheet<Language>
        visible={activePicker === 'language'}
        title={t('settings.language')}
        value={language}
        options={[
          { value: 'en', label: t('settings.languageEnglish') },
          { value: 'hr', label: t('settings.languageCroatian') },
        ]}
        onSelect={handleLanguageChange}
        onClose={() => setActivePicker(null)}
      />

      <SettingsOptionSheet
        visible={activePicker === 'currency'}
        title={t('settings.currency')}
        value={currency}
        options={SUPPORTED_CURRENCIES.map((item) => ({
          value: item,
          label: item,
        }))}
        onSelect={handleCurrencyChange}
        onClose={() => setActivePicker(null)}
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
        onClose={() => setActivePicker(null)}
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
        onClose={() => setActivePicker(null)}
      />
    </>
  );
}
