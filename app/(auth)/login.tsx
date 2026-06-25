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
import { ThemeToggleButton } from '@/components/ui/ThemeSwitcher';
import { Spacing, Typography } from '@/constants/theme';
import { signIn } from '@/lib/auth';
import { useUiStore } from '@/stores/uiStore';
import { translateFieldError } from '@/utils/formHelpers';
import { loginSchema, type LoginFormValues } from '@/utils/validators';

export default function LoginScreen() {
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
          paddingVertical: Spacing.xl,
          justifyContent: 'center',
        },
        themeToggleRow: {
          flexDirection: 'row',
          justifyContent: 'flex-end',
          marginBottom: Spacing.md,
        },
        header: {
          marginBottom: Spacing.xl,
        },
        appName: {
          ...Typography.labelLarge,
          color: theme.colors.primary,
          marginBottom: Spacing.sm,
        },
        title: {
          ...Typography.displayMedium,
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
        forgotLink: {
          alignSelf: 'flex-end',
        },
        forgotText: {
          ...Typography.bodyMedium,
          color: theme.colors.primary,
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
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema as never),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onChange',
  });

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

    showToast({
      message: t('auth.loginSuccess'),
      type: 'success',
    });
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.themeToggleRow}>
            <ThemeToggleButton />
          </View>

          <View style={styles.header}>
            <Text style={styles.appName}>{t('common.appName')}</Text>
            <Text style={styles.title}>{t('auth.loginTitle')}</Text>
            <Text style={styles.subtitle}>{t('auth.loginSubtitle')}</Text>
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

            <Link href="/(auth)/forgot-password" style={styles.forgotLink}>
              <Text style={styles.forgotText}>{t('auth.forgotPassword')}</Text>
            </Link>

            <AppButton
              mode="contained"
              loading={isSubmitting}
              disabled={!isValid}
              onPress={handleSubmit(onSubmit)}
              style={styles.submitButton}
            >
              {t('auth.signIn')}
            </AppButton>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>{t('auth.noAccount')}</Text>
            <Link href="/(auth)/register">
              <Text style={styles.footerLink}>{t('auth.signUp')}</Text>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
