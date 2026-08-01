import { zodResolver } from '@hookform/resolvers/zod';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '@/components/ui/AppButton';
import { AppTextInput } from '@/components/ui/AppTextInput';
import { Text } from '@/components/ui/text';
import { signUp } from '@/lib/auth';
import { useUiStore } from '@/stores/uiStore';
import { translateFieldError } from '@/utils/formHelpers';
import { registerSchema, type RegisterFormValues } from '@/utils/validators';

export default function RegisterScreen() {
  const { t } = useTranslation();
  const showToast = useUiStore((state) => state.showToast);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    <SafeAreaView className="bg-background flex-1" edges={['bottom']}>
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
            <Text className="mb-2 text-2xl font-semibold">{t('auth.registerTitle')}</Text>
            <Text className="text-muted-foreground text-base">{t('auth.registerSubtitle')}</Text>
          </View>

          <View className="gap-4">
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
              className="mt-2"
            >
              {t('auth.createAccount')}
            </AppButton>
          </View>

          <View className="mt-8 flex-row items-center justify-center gap-1">
            <Text className="text-muted-foreground text-sm">{t('auth.haveAccount')}</Text>
            <Link href="/(auth)/login">
              <Text className="text-primary text-sm font-medium">{t('auth.signIn')}</Text>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
