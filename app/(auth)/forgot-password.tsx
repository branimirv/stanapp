import { zodResolver } from '@hookform/resolvers/zod';
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
import { resetPassword } from '@/lib/auth';
import { useUiStore } from '@/stores/uiStore';
import { translateFieldError } from '@/utils/formHelpers';
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '@/utils/validators';

export default function ForgotPasswordScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const showToast = useUiStore((state) => state.showToast);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
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
        successBox: {
          backgroundColor: theme.colors.primaryContainer,
          borderRadius: 12,
          padding: Spacing.lg,
        },
        successText: {
          ...Typography.bodyLarge,
          color: theme.colors.onPrimaryContainer,
          textAlign: 'center',
        },
      }),
    [theme],
  );

  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema as never),
    defaultValues: {
      email: '',
    },
    mode: 'onChange',
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    setIsSubmitting(true);

    const { error } = await resetPassword(values.email.trim());

    setIsSubmitting(false);

    if (error) {
      showToast({
        message: t('auth.resetLinkFailed'),
        type: 'error',
      });
      return;
    }

    setIsSubmitted(true);
    showToast({
      message: t('auth.resetLinkSent'),
      type: 'success',
    });
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
            <Text style={styles.subtitle}>{t('auth.forgotPasswordSubtitle')}</Text>
          </View>

          {isSubmitted ? (
            <View style={styles.successBox}>
              <Text style={styles.successText}>{t('auth.resetLinkSent')}</Text>
            </View>
          ) : (
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
                {t('auth.sendResetLink')}
              </AppButton>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
