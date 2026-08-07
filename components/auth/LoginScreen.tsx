import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocalSearchParams } from 'expo-router';
import { Lock, Mail } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AuthFooter, AuthScreen, AuthTitleBlock } from '@/components/auth/AuthScreen';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { PasswordVisibilityToggle } from '@/components/auth/PasswordVisibilityToggle';
import { AppButton } from '@/components/ui/AppButton';
import { AppCheckbox } from '@/components/ui/AppCheckbox';
import { AppTextInput } from '@/components/ui/AppTextInput';
import { useAppTheme } from '@/hooks/useAppTheme';
import { signIn } from '@/lib/auth';
import { resolveAuthReturnTo, setPendingPostAuthRoute } from '@/lib/authDeepLinks';
import { routes } from '@/lib/routes';
import { useUiStore } from '@/stores/uiStore';
import { translateFieldError } from '@/utils/formHelpers';
import { loadLoginPreferences, saveLoginPreferences } from '@/utils/loginPreferences';
import { loginSchema, type LoginFormValues } from '@/utils/validators';

export function LoginScreen() {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const { returnTo: returnToParam } = useLocalSearchParams<{ returnTo?: string }>();
  const returnTo = resolveAuthReturnTo(returnToParam);
  const showToast = useUiStore((state) => state.showToast);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [passwordVisible, setPasswordVisible] = useState(false);

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
    setPendingPostAuthRoute(returnToParam);
  }, [returnToParam]);

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
    setPendingPostAuthRoute(returnTo);
    const { error } = await signIn(values.email.trim(), values.password);
    setIsSubmitting(false);

    if (error) {
      showToast({ message: t('auth.loginFailed'), type: 'error' });
      return;
    }

    await saveLoginPreferences({
      rememberMe,
      email: rememberMe ? values.email.trim() : '',
    });

    showToast({ message: t('auth.loginSuccess'), type: 'success' });
    // Boot / auth Stack remount navigates via consumePendingPostAuthRoute.
  };

  const { colors } = theme;

  return (
    <AuthScreen contentStyle={{ paddingTop: 0 }}>
      <AuthTitleBlock
        eyebrow={t('common.appName')}
        title={t('auth.loginTitle')}
        subtitle={t('auth.loginSubtitle')}
        // naslov-theme.html Prijava: titleblk margin-top 64
        style={{ marginTop: 64 }}
      />

      <GoogleSignInButton disabled={isSubmitting} returnTo={returnTo} />

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
            placeholder="ime@example.com"
            left={<Mail size={16} color={colors.primary} strokeWidth={2} />}
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
            secureTextEntry={!passwordVisible}
            autoCapitalize="none"
            autoComplete="password"
            returnKeyType="done"
            placeholder="••••••••"
            onSubmitEditing={handleSubmit(onSubmit)}
            containerStyle={{ marginBottom: 0 }}
            left={<Lock size={16} color={colors.primary} strokeWidth={2} />}
            right={
              <PasswordVisibilityToggle
                visible={passwordVisible}
                onToggle={() => setPasswordVisible((v) => !v)}
              />
            }
          />
        )}
      />

      <View className="mt-4 mb-6 flex-row items-center justify-between">
        <AppCheckbox
          checked={rememberMe}
          onChange={handleRememberMeChange}
          label={t('auth.rememberMe')}
        />
        <Link href={routes.auth.forgotPassword}>
          <Text className="text-primary text-sm font-semibold">{t('auth.forgotPassword')}</Text>
        </Link>
      </View>

      <AppButton
        mode="contained"
        loading={isSubmitting}
        disabled={!isValid}
        onPress={handleSubmit(onSubmit)}
        className="h-11 w-full rounded-full"
      >
        {t('auth.signIn')}
      </AppButton>

      <AuthFooter
        prompt={t('auth.noAccount')}
        actionLabel={t('auth.signUp')}
        href={routes.auth.register}
      />
    </AuthScreen>
  );
}
