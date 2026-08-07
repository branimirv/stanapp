import { zodResolver } from '@hookform/resolvers/zod';
import { Lock } from 'lucide-react-native';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AuthScreen, AuthTitleBlock } from '@/components/auth/AuthScreen';
import { PasswordVisibilityToggle } from '@/components/auth/PasswordVisibilityToggle';
import { AppButton } from '@/components/ui/AppButton';
import { AppTextInput } from '@/components/ui/AppTextInput';
import { Text } from '@/components/ui/text';
import { useAppTheme } from '@/hooks/useAppTheme';
import { updatePassword } from '@/lib/auth';
import { useAuthStore } from '@/stores/authStore';
import { useUiStore } from '@/stores/uiStore';
import { translateFieldError } from '@/utils/formHelpers';
import { resetPasswordSchema, type ResetPasswordFormValues } from '@/utils/validators';

export default function ResetPasswordScreen() {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const session = useAuthStore((s) => s.session);
  const isAuthLoading = useAuthStore((s) => s.isLoading);
  const showToast = useUiStore((s) => s.showToast);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema as never),
    defaultValues: {
      password: '',
      confirm_password: '',
    },
    mode: 'onChange',
  });

  useEffect(() => {
    if (isAuthLoading) return;
    if (!session) {
      // Deep-link token exchange may still be in flight briefly; stay put until
      // auth store settles, then send unsigned users to request a new link.
      const id = setTimeout(() => {
        if (!useAuthStore.getState().session) {
          router.replace('/(auth)/forgot-password');
        }
      }, 800);
      return () => clearTimeout(id);
    }
  }, [isAuthLoading, session]);

  const onSubmit = async (values: ResetPasswordFormValues) => {
    setIsSubmitting(true);
    const { error } = await updatePassword(values.password);
    setIsSubmitting(false);

    if (error) {
      showToast({ message: t('auth.resetPasswordFailed'), type: 'error' });
      return;
    }

    showToast({ message: t('auth.passwordChanged'), type: 'success' });
    router.replace('/(tabs)/(dashboard)');
  };

  const { colors } = theme;

  if (isAuthLoading || !session) {
    return (
      <AuthScreen>
        <ActivityIndicator color={colors.primary} />
        <Text className="text-muted-foreground mt-4 text-center text-sm">
          {t('auth.resetPasswordPreparing')}
        </Text>
      </AuthScreen>
    );
  }

  return (
    <AuthScreen>
      <AuthTitleBlock
        title={t('auth.resetPasswordTitle')}
        subtitle={t('auth.resetPasswordSubtitle')}
      />

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value, ref }, fieldState }) => (
          <AppTextInput
            ref={ref}
            label={t('auth.newPassword')}
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
            containerStyle={styles.lastField}
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
        {t('auth.resetPassword')}
      </AppButton>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  lastField: {
    marginBottom: 24,
  },
});
