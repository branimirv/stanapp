import { zodResolver } from '@hookform/resolvers/zod';
import { Link, router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '@/components/ui/AppButton';
import { AppTextInput } from '@/components/ui/AppTextInput';
import { Spacing, Typography } from '@/constants/theme';
import { signUp } from '@/lib/auth';
import { useUiStore } from '@/stores/uiStore';
import { translateFieldError } from '@/utils/formHelpers';
import { registerSchema, type RegisterFormValues } from '@/utils/validators';

export default function RegisterScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const showToast = useUiStore((state) => state.showToast);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const styles = useMemo(
    () =>
      StyleSheet.create({
        safeArea: {
          flex: 1,
          backgroundColor: theme.colors.background,
        },
        flex: {
          flex: 1,
        },
        scrollContent: {
          flexGrow: 1,
          paddingHorizontal: Spacing.lg,
          paddingVertical: Spacing.lg,
        },
        header: {
          marginBottom: Spacing.xl,
        },
        title: {
          ...Typography.headlineLarge,
          color: theme.colors.onBackground,
          marginBottom: Spacing.sm,
        },
        subtitle: {
          ...Typography.bodyLarge,
          color: theme.colors.onSurfaceVariant,
        },
        form: {
          gap: Spacing.md,
        },
        submitButton: {
          marginTop: Spacing.sm,
        },
        footer: {
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          gap: Spacing.xs,
          marginTop: Spacing.xl,
        },
        footerText: {
          ...Typography.bodyMedium,
          color: theme.colors.onSurfaceVariant,
        },
        footerLink: {
          ...Typography.labelLarge,
          color: theme.colors.primary,
        },
      }),
    [theme],
  );

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
      showToast({
        message: t('auth.registerFailed'),
        type: 'error',
      });
      return;
    }

    if (needsEmailConfirmation) {
      showToast({
        message: t('auth.emailConfirmationNotice'),
        type: 'info',
      });
    } else {
      showToast({
        message: t('auth.registerSuccess'),
        type: 'success',
      });
    }

    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>{t('auth.registerTitle')}</Text>
            <Text style={styles.subtitle}>{t('auth.registerSubtitle')}</Text>
          </View>

          <View style={styles.form}>
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
                  autoComplete="new-password"
                  returnKeyType="next"
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
                  secureTextEntry
                  autoCapitalize="none"
                  autoComplete="new-password"
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit(onSubmit)}
                />
              )}
            />

            <AppButton
              mode="contained"
              loading={isSubmitting}
              disabled={!isValid}
              onPress={handleSubmit(onSubmit)}
              style={styles.submitButton}
            >
              {t('auth.createAccount')}
            </AppButton>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>{t('auth.haveAccount')}</Text>
            <Link href="/(auth)/login">
              <Text style={styles.footerLink}>{t('auth.signIn')}</Text>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
