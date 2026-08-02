import { zodResolver } from '@hookform/resolvers/zod';
import { Link, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '@/components/ui/AppButton';
import { AppCheckbox } from '@/components/ui/AppCheckbox';
import { AppTextInput } from '@/components/ui/AppTextInput';
import { ThemeToggleButton } from '@/components/ui/ThemeSwitcher';
import { Text } from '@/components/ui/text';
import { signIn } from '@/lib/auth';
import { useUiStore } from '@/stores/uiStore';
import { translateFieldError } from '@/utils/formHelpers';
import { loadLoginPreferences, saveLoginPreferences } from '@/utils/loginPreferences';
import { loginSchema, type LoginFormValues } from '@/utils/validators';

export default function LoginScreen() {
  const { t } = useTranslation();
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

  return (
    <SafeAreaView className="flex-1 bg-transparent">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerClassName="flex-grow justify-center px-6 py-8"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="mb-4 flex-row justify-end">
            <ThemeToggleButton />
          </View>

          <View className="mb-8">
            <Text className="text-primary mb-2 text-sm font-medium">{t('common.appName')}</Text>
            <Text className="mb-2 text-3xl font-bold">{t('auth.loginTitle')}</Text>
            <Text className="text-muted-foreground text-base">{t('auth.loginSubtitle')}</Text>
          </View>

          <View className="gap-4">
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

            <View className="flex-row items-center justify-between">
              <AppCheckbox
                checked={rememberMe}
                onChange={handleRememberMeChange}
                label={t('auth.rememberMe')}
              />

              <Link href="/(auth)/forgot-password">
                <Text className="text-primary text-sm font-medium">
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

          <View className="mt-8 flex-row items-center justify-center gap-1">
            <Text className="text-muted-foreground text-sm">{t('auth.noAccount')}</Text>
            <Link href="/(auth)/register">
              <Text className="text-primary text-sm font-medium">{t('auth.signUp')}</Text>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
