import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { useAppHeaderOptions } from '@/hooks/useAppHeaderOptions';

export const unstable_settings = {
  initialRouteName: 'login',
};

export default function AuthLayout() {
  const { t } = useTranslation();
  const themedScreenOptions = useAppHeaderOptions();

  return (
    <Stack
      initialRouteName="login"
      screenOptions={{
        ...themedScreenOptions,
        headerBackTitle: t('common.back'),
      }}
    >
      <Stack.Screen
        name="login"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="register"
        options={{
          title: t('auth.register'),
        }}
      />
      <Stack.Screen
        name="forgot-password"
        options={{
          title: t('auth.forgotPasswordTitle'),
        }}
      />
    </Stack>
  );
}
