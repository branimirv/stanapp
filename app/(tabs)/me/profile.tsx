import { zodResolver } from '@hookform/resolvers/zod';
import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppButton } from '@/components/ui/AppButton';
import { AppPicker } from '@/components/ui/AppPicker';
import { AppTextInput } from '@/components/ui/AppTextInput';
import { ErrorState } from '@/components/ui/ErrorState';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { LANGUAGES, SUPPORTED_CURRENCIES, THEMES } from '@/constants/config';
import { Spacing } from '@/constants/theme';
import { useProfile } from '@/hooks/useProfile';
import i18n from '@/i18n';
import { useUiStore } from '@/stores/uiStore';
import type { Language, Theme } from '@/types/app.types';
import { profileSchema, type ProfileFormValues } from '@/utils/validators';
import { translateFieldError } from '@/utils/formHelpers';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Controller, useForm } from 'react-hook-form';

export default function ProfileSettingsScreen() {
  const { t } = useTranslation();
  const showToast = useUiStore((s) => s.showToast);
  const { profile, isLoading, error, refetch, updateProfile } = useProfile();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema as never),
    values: profile
      ? {
          full_name: profile.full_name,
          default_currency: profile.default_currency as ProfileFormValues['default_currency'],
          language: profile.language,
          theme: profile.theme,
        }
      : undefined,
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    setIsSaving(true);
    try {
      await updateProfile(values);
      if (values.language !== i18n.language) {
        await i18n.changeLanguage(values.language);
        await AsyncStorage.setItem('@stanapp/language', values.language);
      }
      showToast({ message: t('settings.saveSuccess'), type: 'success' });
      router.back();
    } catch (err) {
      showToast({
        message: err instanceof Error ? err.message : t('settings.saveFailed'),
        type: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  });

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ title: t('settings.editProfile') }} />
        <SkeletonLoader count={5} style={styles.loader} />
      </>
    );
  }

  if (error || !profile) {
    return (
      <>
        <Stack.Screen options={{ title: t('settings.editProfile') }} />
        <ErrorState message={error ?? t('settings.loadFailed')} onRetry={refetch} />
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: t('settings.editProfile') }} />

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <AppTextInput
          control={form.control}
          name="full_name"
          label={t('settings.displayName')}
          error={translateFieldError(t, form.formState.errors.full_name?.message)}
        />

        <Controller
          control={form.control}
          name="language"
          render={({ field: { value, onChange }, fieldState }) => (
            <AppPicker<Language>
              label={t('settings.language')}
              options={LANGUAGES.map((lang) => ({
                value: lang,
                label: lang === 'en' ? t('settings.languageEnglish') : t('settings.languageCroatian'),
              }))}
              value={value}
              onValueChange={onChange}
              error={translateFieldError(t, fieldState.error?.message)}
            />
          )}
        />

        <Controller
          control={form.control}
          name="default_currency"
          render={({ field: { value, onChange }, fieldState }) => (
            <AppPicker
              label={t('settings.currency')}
              options={SUPPORTED_CURRENCIES.map((currency) => ({
                value: currency,
                label: currency,
              }))}
              value={value}
              onValueChange={onChange}
              error={translateFieldError(t, fieldState.error?.message)}
            />
          )}
        />

        <Controller
          control={form.control}
          name="theme"
          render={({ field: { value, onChange }, fieldState }) => (
            <AppPicker<Theme>
              label={t('settings.theme')}
              options={THEMES.map((themeValue) => ({
                value: themeValue,
                label: t(`settings.theme${themeValue.charAt(0).toUpperCase()}${themeValue.slice(1)}`),
              }))}
              value={value}
              onValueChange={onChange}
              error={translateFieldError(t, fieldState.error?.message)}
            />
          )}
        />

        <AppButton mode="contained" onPress={handleSubmit} loading={isSaving}>
          {t('common.save')}
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
    gap: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
});
