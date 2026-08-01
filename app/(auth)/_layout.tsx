import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { useAppHeaderOptions } from '@/hooks/useAppHeaderOptions';
import { useAppTheme } from '@/hooks/useAppTheme';

export default function AuthLayout() {
  const { t } = useTranslation();
  const { isDark } = useAppTheme();
  const themedScreenOptions = useAppHeaderOptions();

  return (
    <Stack
      key={isDark ? 'dark' : 'light'}
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
