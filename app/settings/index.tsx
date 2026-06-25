import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { router, Stack } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Divider, Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { AppButton } from '@/components/ui/AppButton';
import { AppPicker } from '@/components/ui/AppPicker';
import { AppSegmentedControl } from '@/components/ui/AppSegmentedControl';
import { ErrorState } from '@/components/ui/ErrorState';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { ThemeSwitcher } from '@/components/ui/ThemeSwitcher';
import { SUPPORTED_CURRENCIES } from '@/constants/config';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { useProfile } from '@/hooks/useProfile';
import i18n from '@/i18n';
import { signOut } from '@/lib/auth';
import { useAuthStore } from '@/stores/authStore';
import { useUiStore } from '@/stores/uiStore';
import type { Language, Theme } from '@/types/app.types';
import { exportAllDataCSV } from '@/utils/export';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
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
        <Stack.Screen options={{ title: t('settings.title') }} />
        <SkeletonLoader count={8} style={styles.loader} />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Stack.Screen options={{ title: t('settings.title') }} />
        <ErrorState message={error} onRetry={refetch} />
      </>
    );
  }

  const language = profile?.language ?? 'hr';

  return (
    <>
      <Stack.Screen options={{ title: t('settings.title') }} />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.sectionTitle, { color: theme.colors.onSurfaceVariant }]}>
          {t('settings.account')}
        </Text>
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.dark ? Colors.surfaceDark : Colors.surface,
              borderColor: theme.dark ? Colors.borderDark : Colors.border,
            },
          ]}
        >
          <Text style={[styles.displayName, { color: theme.colors.onSurface }]}>
            {profile?.full_name}
          </Text>
          <Text style={{ color: theme.colors.onSurfaceVariant }}>{user?.email}</Text>

          <Pressable style={styles.rowLink} onPress={() => router.push('/settings/profile')}>
            <Text style={{ color: theme.colors.primary }}>{t('settings.editProfile')}</Text>
            <ChevronRight size={18} color={theme.colors.primary} />
          </Pressable>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.colors.onSurfaceVariant }]}>
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

        <Text style={[styles.sectionTitle, { color: theme.colors.onSurfaceVariant }]}>
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
        <Text style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
          {t('settings.currencyHint')}
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.colors.onSurfaceVariant }]}>
          {t('settings.appearance')}
        </Text>
        <ThemeSwitcher onPersist={handleThemeChange} />

        <Text style={[styles.sectionTitle, { color: theme.colors.onSurfaceVariant }]}>
          {t('settings.notifications')}
        </Text>
        <Pressable style={styles.rowLink} onPress={() => router.push('/settings/notifications')}>
          <View style={styles.flex}>
            <Text style={{ color: theme.colors.onSurface }}>
              {t('settings.notificationPreferences')}
            </Text>
            <Text style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
              {t('settings.dueDateRemindersHint')}
            </Text>
          </View>
          <ChevronRight size={18} color={theme.colors.onSurfaceVariant} />
        </Pressable>

        <Text style={[styles.sectionTitle, { color: theme.colors.onSurfaceVariant }]}>
          {t('settings.data')}
        </Text>
        <AppButton mode="outlined" loading={isExporting} onPress={handleExport} icon="download">
          {t('settings.exportData')}
        </AppButton>
        <Text style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
          {t('settings.exportDataHint')}
        </Text>

        <Divider style={styles.divider} />

        <Text style={[styles.sectionTitle, { color: theme.colors.onSurfaceVariant }]}>
          {t('settings.about')}
        </Text>
        <Text style={{ color: theme.colors.onSurfaceVariant }}>
          {t('settings.version')}: {Constants.expoConfig?.version ?? '1.0.0'}
        </Text>
        <Pressable onPress={() => Linking.openURL('https://stanapp.app/privacy')}>
          <Text style={[styles.link, { color: theme.colors.primary }]}>
            {t('settings.privacyPolicy')}
          </Text>
        </Pressable>
        <Pressable onPress={() => Linking.openURL('https://stanapp.app/terms')}>
          <Text style={[styles.link, { color: theme.colors.primary }]}>
            {t('settings.termsOfService')}
          </Text>
        </Pressable>

        <AppButton
          mode="contained"
          onPress={handleSignOut}
          buttonColor={theme.colors.error}
          style={styles.signOut}
        >
          {t('settings.signOut')}
        </AppButton>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  loader: {
    padding: Spacing.md,
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
    gap: Spacing.md,
  },
  sectionTitle: {
    ...Typography.labelLarge,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  displayName: {
    ...Typography.titleLarge,
  },
  rowLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  flex: {
    flex: 1,
  },
  hint: {
    ...Typography.bodySmall,
  },
  divider: {
    marginVertical: Spacing.sm,
  },
  link: {
    ...Typography.bodyMedium,
    marginTop: Spacing.xs,
  },
  signOut: {
    marginTop: Spacing.lg,
  },
});
