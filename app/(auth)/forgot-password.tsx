import { zodResolver } from '@hookform/resolvers/zod';
import { Mail } from 'lucide-react-native';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AuthScreen, AuthTitleBlock } from '@/components/auth/AuthScreen';
import { AppButton } from '@/components/ui/AppButton';
import { AppTextInput } from '@/components/ui/AppTextInput';
import { Text } from '@/components/ui/text';
import { useAppTheme } from '@/hooks/useAppTheme';
import { resetPassword } from '@/lib/auth';
import { useUiStore } from '@/stores/uiStore';
import { translateFieldError } from '@/utils/formHelpers';
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '@/utils/validators';

export default function ForgotPasswordScreen() {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const showToast = useUiStore((state) => state.showToast);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema as never),
    defaultValues: { email: '' },
    mode: 'onChange',
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    setIsSubmitting(true);
    const { error } = await resetPassword(values.email.trim());
    setIsSubmitting(false);

    if (error) {
      showToast({ message: t('auth.resetLinkFailed'), type: 'error' });
      return;
    }

    setIsSubmitted(true);
    showToast({ message: t('auth.resetLinkSent'), type: 'success' });
  };

  const { colors } = theme;

  return (
    <AuthScreen showBack>
      <AuthTitleBlock
        title={t('auth.forgotPasswordTitle')}
        subtitle={t('auth.forgotPasswordSubtitle')}
      />

      {isSubmitted ? (
        <View className="bg-primary-tint rounded-xl p-6">
          <Text className="text-fg text-center text-sm leading-[21px]">
            {t('auth.resetLinkSent')}
          </Text>
        </View>
      ) : (
        <>
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
                placeholder="ime@example.com"
                onSubmitEditing={handleSubmit(onSubmit)}
                containerStyle={{ marginBottom: 24 }}
                left={<Mail size={16} color={colors.primary} strokeWidth={2} />}
              />
            )}
          />

          <AppButton
            variant="default"
            loading={isSubmitting}
            disabled={!isValid}
            onPress={handleSubmit(onSubmit)}
            className="h-11 w-full rounded-full"
          >
            {t('auth.sendResetLink')}
          </AppButton>
        </>
      )}
    </AuthScreen>
  );
}
