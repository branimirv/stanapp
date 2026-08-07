import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocalSearchParams } from 'expo-router';
import { Lock, Mail } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, Text, View } from 'react-native';
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
import { Fonts } from '@/lib/fonts';
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
    <AuthScreen contentStyle={styles.content}>
      <AuthTitleBlock
        eyebrow={t('common.appName')}
        title={t('auth.loginTitle')}
        subtitle={t('auth.loginSubtitle')}
        style={styles.titleBlock}
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
            containerStyle={styles.passwordField}
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

      <View style={styles.chkRow}>
        <AppCheckbox
          checked={rememberMe}
          onChange={handleRememberMeChange}
          label={t('auth.rememberMe')}
        />
        <Link href="/(auth)/forgot-password">
          <Text
            style={{
              fontFamily: Fonts.sans.semibold,
              fontSize: 14,
              color: colors.primary,
            }}
          >
            {t('auth.forgotPassword')}
          </Text>
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
        href="/(auth)/register"
      />
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 0,
  },
  titleBlock: {
    // naslov-theme.html Prijava: titleblk margin-top 64
    marginTop: 64,
  },
  passwordField: {
    marginBottom: 0,
  },
  chkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 24,
  },
});
