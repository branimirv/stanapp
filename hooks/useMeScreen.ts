import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useAppTheme } from '@/hooks/useAppTheme';
import { useMyMemberships } from '@/hooks/useMembers';
import { useProfile } from '@/hooks/useProfile';
import { useProperties } from '@/hooks/useProperties';
import { useTabBarPreference, type TabBarLabelMode } from '@/hooks/useTabBarPreference';
import { useTenants } from '@/hooks/useTenants';
import i18n from '@/i18n';
import { useAuthStore } from '@/stores/authStore';
import { useTabBarStore } from '@/stores/tabBarStore';
import { useUiStore } from '@/stores/uiStore';
import type { Language, Theme } from '@/types/app.types';
import { getInitialsFromFullName, splitDisplayName } from '@/utils/avatar';
import { exportAllDataCSV } from '@/utils/export';
import { loadNotificationPreferences } from '@/utils/notificationPreferences';

export type MePickerKind = 'language' | 'theme' | 'tabBar' | null;

/** Orchestration for the Me tab: profile data, pickers, and preference actions. */
export function useMeScreen() {
  const { t } = useTranslation();
  const { preference, setPreference } = useAppTheme();
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

  const [isExporting, setIsExporting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [notificationsEnabledCount, setNotificationsEnabledCount] = useState(0);
  const [activePicker, setActivePicker] = useState<MePickerKind>(null);

  const ownsAnyProperty = useMemo(
    () => memberships.some((membership) => membership.role === 'owner'),
    [memberships],
  );

  const openPicker = useCallback(
    (kind: Exclude<MePickerKind, null>) => {
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

  const languageLabel =
    language === 'en' ? t('settings.languageEnglish') : t('settings.languageCroatian');

  const notificationsBadge =
    notificationsEnabledCount > 0
      ? t('settings.notificationsOnCount', { count: notificationsEnabledCount })
      : t('common.off');

  const statBays = useMemo(
    () =>
      [
        { label: t('settings.objectsBay'), value: objectCount },
        { label: t('settings.unitsBay'), value: unitCount },
        { label: t('settings.contractsBay'), value: contractCount },
      ] as const,
    [contractCount, objectCount, t, unitCount],
  );

  return {
    t,
    preference,
    labelMode,
    userEmail: user?.email,
    isLoading,
    error,
    refetchProfile,
    ownsAnyProperty,
    isExporting,
    refreshing,
    notificationsEnabledCount,
    activePicker,
    language,
    nameParts,
    initials,
    languageLabel,
    notificationsBadge,
    versionLabel: Constants.expoConfig?.version ?? '1.0.0',
    pickerOpen: activePicker != null,
    statBays,
    openPicker,
    closePicker,
    handleLanguageChange,
    handleThemeChange,
    handleTabBarChange,
    handleExport,
    handleSignOut,
    onRefresh,
  };
}
