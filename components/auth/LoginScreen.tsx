import { zodResolver } from '@hookform/resolvers/zod';
import { Link, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '@/components/ui/AppButton';
import { AppCheckbox } from '@/components/ui/AppCheckbox';
import { AppTextInput } from '@/components/ui/AppTextInput';
import { ThemeToggleButton } from '@/components/ui/ThemeSwitcher';
import { Text } from '@/components/ui/text';
import { Colors } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { signIn } from '@/lib/auth';
import { useUiStore } from '@/stores/uiStore';
import { translateFieldError } from '@/utils/formHelpers';
import { loadLoginPreferences, saveLoginPreferences } from '@/utils/loginPreferences';
import { loginSchema, type LoginFormValues } from '@/utils/validators';

export function LoginScreen() {
  const { t } = useTranslation();
  const { isDark } = useAppTheme();
  const showToast = useUiStore((state) => state.showToast);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isValid },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema as never),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onChange',
  });

  useEffect(() => {
    loadLoginPreferences().then((preferences) => {
      setRememberMe(preferences.rememberMe);
      if (preferences.rememberMe && preferences.email) {
        reset({ email: preferences.email, password: '' });
      }
    });
  }, [reset]);

  const handleRememberMeChange = async (checked: boolean) => {
    setRememberMe(checked);
    const preferences = await loadLoginPreferences();
    await saveLoginPreferences({
      ...preferences,
      rememberMe: checked,
      email: checked ? preferences.email : '',
    });
  };

  const onSubmit = async (values: LoginFormValues) => {
    setIsSubmitting(true);

    const { error } = await signIn(values.email.trim(), values.password);

    setIsSubmitting(false);

    if (error) {
      showToast({
        message: t('auth.loginFailed'),
        type: 'error',
      });
      return;
    }

    await saveLoginPreferences({
      rememberMe,
      email: rememberMe ? values.email.trim() : '',
    });

    showToast({
      message: t('auth.loginSuccess'),
      type: 'success',
    });
    router.replace('/(tabs)/(dashboard)');
  };

  const titleColor = isDark ? Colors.textInverse : Colors.textPrimary;
  const mutedColor = Colors.textSecondary;

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.themeRow}>
            <ThemeToggleButton />
          </View>

          <View style={styles.header}>
            <Text style={[styles.brand, { color: Colors.primary }]}>{t('common.appName')}</Text>
            <Text style={[styles.title, { color: titleColor }]}>{t('auth.loginTitle')}</Text>
            <Text style={[styles.subtitle, { color: mutedColor }]}>{t('auth.loginSubtitle')}</Text>
          </View>

          <View style={styles.form}>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value, ref }, fieldState }) => (
                <AppTextInput
                  ref={ref}
                  label={t('auth.email')}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={translateFieldError(t, fieldState.error?.message)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect={false}
                  returnKeyType="next"
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value, ref }, fieldState }) => (
                <AppTextInput
                  ref={ref}
                  label={t('auth.password')}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={translateFieldError(t, fieldState.error?.message)}
                  secureTextEntry
                  autoCapitalize="none"
                  autoComplete="password"
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit(onSubmit)}
                />
              )}
            />

            <View style={styles.rowBetween}>
              <AppCheckbox
                checked={rememberMe}
                onChange={handleRememberMeChange}
                label={t('auth.rememberMe')}
              />

              <Link href="/(auth)/forgot-password">
                <Text style={[styles.link, { color: Colors.primary }]}>
                  {t('auth.forgotPassword')}
                </Text>
              </Link>
            </View>

            <AppButton
              mode="contained"
              loading={isSubmitting}
              disabled={!isValid}
              onPress={handleSubmit(onSubmit)}
              className="mt-2"
            >
              {t('auth.signIn')}
            </AppButton>
          </View>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: mutedColor }]}>{t('auth.noAccount')}</Text>
            <Link href="/(auth)/register">
              <Text style={[styles.link, { color: Colors.primary }]}>{t('auth.signUp')}</Text>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  themeRow: {
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  header: {
    marginBottom: 32,
  },
  brand: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  title: {
    marginBottom: 8,
    fontSize: 30,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 16,
  },
  form: {
    gap: 16,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  link: {
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    marginTop: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: 14,
  },
});
