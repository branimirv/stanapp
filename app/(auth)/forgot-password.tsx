import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppButton } from '@/components/ui/AppButton';
import { AppTextInput } from '@/components/ui/AppTextInput';
import { StackScreenChrome } from '@/components/ui/StackScreenChrome';
import { Text } from '@/components/ui/text';
import { resetPassword } from '@/lib/auth';
import { useUiStore } from '@/stores/uiStore';
import { translateFieldError } from '@/utils/formHelpers';
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '@/utils/validators';

export default function ForgotPasswordScreen() {
  const { t } = useTranslation();
  const showToast = useUiStore((state) => state.showToast);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

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
    <StackScreenChrome title={t('auth.forgotPasswordTitle')}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerClassName="flex-grow px-6 py-6"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="mb-8">
            <Text className="text-muted-foreground text-base">
              {t('auth.forgotPasswordSubtitle')}
            </Text>
          </View>

          {isSubmitted ? (
            <View className="bg-primary/10 rounded-xl p-6">
              <Text className="text-center text-base">{t('auth.resetLinkSent')}</Text>
            </View>
          ) : (
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
                className="mt-2"
              >
                {t('auth.sendResetLink')}
              </AppButton>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </StackScreenChrome>
  );
}
