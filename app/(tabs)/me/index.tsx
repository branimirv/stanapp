import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { router, Stack } from 'expo-router';
import { ChevronRight, Download } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { Linking, Pressable, ScrollView, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppButton } from '@/components/ui/AppButton';
import { AppPicker } from '@/components/ui/AppPicker';
import { AppSegmentedControl } from '@/components/ui/AppSegmentedControl';
import { ErrorState } from '@/components/ui/ErrorState';
import { Icon } from '@/components/ui/icon';
import { Separator } from '@/components/ui/separator';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { TabBarStyleSwitcher } from '@/components/ui/TabBarStyleSwitcher';
import { Text } from '@/components/ui/text';
import { ThemeSwitcher } from '@/components/ui/ThemeSwitcher';
import { SUPPORTED_CURRENCIES } from '@/constants/config';
import { tabRootScreenOptions } from '@/constants/header';
import { useProfile } from '@/hooks/useProfile';
import i18n from '@/i18n';
import { signOut } from '@/lib/auth';
import { useAuthStore } from '@/stores/authStore';
import { useUiStore } from '@/stores/uiStore';
import type { Language, Theme } from '@/types/app.types';
import { exportAllDataCSV } from '@/utils/export';

export default function MeScreen() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const showToast = useUiStore((s) => s.showToast);
  const showConfirmDialog = useUiStore((s) => s.showConfirmDialog);

  const {
    profile,
    isLoading,
    error,
    refetch,
    updateLanguage,
    updateCurrency,
    updateTheme,
  } = useProfile();

  const [isExporting, setIsExporting] = useState(false);

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
        await updateTheme(nextTheme);
        showToast({ message: t('settings.themeUpdated'), type: 'success' });
      } catch (err) {
        showToast({
          message: err instanceof Error ? err.message : t('settings.saveFailed'),
          type: 'error',
        });
      }
    },
    [showToast, t, updateTheme],
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

  const language = profile?.language ?? 'hr';

  return (
    <>
      <Stack.Screen options={tabRootScreenOptions(t('tabs.me'))} />

      <ScrollView contentContainerClassName="gap-4 p-4 pb-12">
        <Text className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
          {t('settings.account')}
        </Text>
        <View className="bg-card border-border gap-1 rounded-xl border p-4">
          <Text className="text-lg font-semibold">{profile?.full_name}</Text>
          <Text className="text-muted-foreground">{user?.email}</Text>

          <Pressable
            className="flex-row items-center justify-between py-2"
            onPress={() => router.push('/(tabs)/me/profile')}
          >
            <Text className="text-primary">{t('settings.editProfile')}</Text>
            <Icon as={ChevronRight} size={18} className="text-primary" />
          </Pressable>
        </View>

        <Text className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
          {t('settings.language')}
        </Text>
        <AppSegmentedControl<Language>
          segments={[
            { value: 'en', label: t('settings.languageEnglish') },
            { value: 'hr', label: t('settings.languageCroatian') },
          ]}
          value={language}
          onValueChange={handleLanguageChange}
        />

        <Text className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
          {t('settings.currency')}
        </Text>
        <AppPicker
          label={t('settings.currency')}
          options={SUPPORTED_CURRENCIES.map((currency) => ({
            value: currency,
            label: currency,
          }))}
          value={profile?.default_currency ?? 'EUR'}
          onValueChange={handleCurrencyChange}
        />
        <Text className="text-muted-foreground text-xs">{t('settings.currencyHint')}</Text>

        <Text className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
          {t('settings.appearance')}
        </Text>
        <ThemeSwitcher onPersist={handleThemeChange} />

        <Text className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
          {t('settings.tabBarStyle')}
        </Text>
        <TabBarStyleSwitcher
          onPersist={() => {
            showToast({ message: t('settings.tabBarStyleUpdated'), type: 'success' });
          }}
        />
        <Text className="text-muted-foreground text-xs">{t('settings.tabBarStyleHint')}</Text>

        <Text className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
          {t('settings.notifications')}
        </Text>
        <Pressable
          className="flex-row items-center justify-between py-2"
          onPress={() => router.push('/(tabs)/me/notifications')}
        >
          <View className="flex-1">
            <Text>{t('settings.notificationPreferences')}</Text>
            <Text className="text-muted-foreground text-xs">
              {t('settings.dueDateRemindersHint')}
            </Text>
          </View>
          <Icon as={ChevronRight} size={18} className="text-muted-foreground" />
        </Pressable>

        <Text className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
          {t('settings.data')}
        </Text>
        <AppButton mode="outlined" loading={isExporting} onPress={handleExport}>
          <View className="flex-row items-center gap-2">
            <Icon as={Download} size={18} />
            <Text>{t('settings.exportData')}</Text>
          </View>
        </AppButton>
        <Text className="text-muted-foreground text-xs">{t('settings.exportDataHint')}</Text>

        <Separator className="my-2" />

        <Text className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
          {t('settings.about')}
        </Text>
        <Text className="text-muted-foreground">
          {t('settings.version')}: {Constants.expoConfig?.version ?? '1.0.0'}
        </Text>
        <Pressable onPress={() => Linking.openURL('https://stanapp.app/privacy')}>
          <Text className="text-primary mt-1 text-sm">{t('settings.privacyPolicy')}</Text>
        </Pressable>
        <Pressable onPress={() => Linking.openURL('https://stanapp.app/terms')}>
          <Text className="text-primary mt-1 text-sm">{t('settings.termsOfService')}</Text>
        </Pressable>

        <AppButton
          mode="contained"
          textColor="destructive"
          onPress={handleSignOut}
          className="mt-6"
        >
          {t('settings.signOut')}
        </AppButton>
      </ScrollView>
    </>
  );
}
