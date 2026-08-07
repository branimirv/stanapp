import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { Lock, Mail } from 'lucide-react-native';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { AuthFooter, AuthScreen, AuthTitleBlock } from '@/components/auth/AuthScreen';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { PasswordVisibilityToggle } from '@/components/auth/PasswordVisibilityToggle';
import { AppButton } from '@/components/ui/AppButton';
import { AppTextInput } from '@/components/ui/AppTextInput';
import { useAppTheme } from '@/hooks/useAppTheme';
import { signUp } from '@/lib/auth';
import { routes } from '@/lib/routes';
import { useUiStore } from '@/stores/uiStore';
import { translateFieldError } from '@/utils/formHelpers';
import { registerSchema, type RegisterFormValues } from '@/utils/validators';

export default function RegisterScreen() {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const showToast = useUiStore((state) => state.showToast);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema as never),
    defaultValues: {
      full_name: '',
      email: '',
      password: '',
      confirm_password: '',
    },
    mode: 'onChange',
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setIsSubmitting(true);
    const { error, needsEmailConfirmation } = await signUp(
      values.email.trim(),
      values.password,
      values.full_name.trim(),
    );
    setIsSubmitting(false);

    if (error) {
      showToast({ message: t('auth.registerFailed'), type: 'error' });
      return;
    }

    if (needsEmailConfirmation) {
      showToast({ message: t('auth.emailConfirmationNotice'), type: 'info' });
    } else {
      showToast({ message: t('auth.registerSuccess'), type: 'success' });
    }

    router.replace(routes.home);
  };

  const { colors } = theme;

  return (
    <AuthScreen showBack>
      <AuthTitleBlock title={t('auth.registerTitle')} subtitle={t('auth.registerSubtitle')} />

      <GoogleSignInButton disabled={isSubmitting} />

      <Controller
        control={control}
        name="full_name"
        render={({ field: { onChange, onBlur, value, ref }, fieldState }) => (
          <AppTextInput
            ref={ref}
            label={t('auth.fullName')}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={translateFieldError(t, fieldState.error?.message)}
            autoCapitalize="words"
            autoComplete="name"
            returnKeyType="next"
            placeholder={t('auth.fullName')}
          />
        )}
      />

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
            autoComplete="new-password"
            returnKeyType="next"
            placeholder="••••••••"
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

      <Controller
        control={control}
        name="confirm_password"
        render={({ field: { onChange, onBlur, value, ref }, fieldState }) => (
          <AppTextInput
            ref={ref}
            label={t('auth.confirmPassword')}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={translateFieldError(t, fieldState.error?.message)}
            secureTextEntry={!confirmVisible}
            autoCapitalize="none"
            autoComplete="new-password"
            returnKeyType="done"
            placeholder="••••••••"
            onSubmitEditing={handleSubmit(onSubmit)}
            containerStyle={{ marginBottom: 24 }}
            left={<Lock size={16} color={colors.primary} strokeWidth={2} />}
            right={
              <PasswordVisibilityToggle
                visible={confirmVisible}
                onToggle={() => setConfirmVisible((v) => !v)}
              />
            }
          />
        )}
      />

      <AppButton
        mode="contained"
        loading={isSubmitting}
        disabled={!isValid}
        onPress={handleSubmit(onSubmit)}
        className="h-11 w-full rounded-full"
      >
        {t('auth.createAccount')}
      </AppButton>

      <AuthFooter
        prompt={t('auth.haveAccount')}
        actionLabel={t('auth.signInLink')}
        href={routes.auth.login}
      />
    </AuthScreen>
  );
}
