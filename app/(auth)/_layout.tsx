import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'react-native-paper';

import { useThemedStackScreenOptions } from '@/hooks/useThemedStackScreenOptions';

export default function AuthLayout() {
  const { t } = useTranslation();
  const theme = useTheme();
  const themedScreenOptions = useThemedStackScreenOptions();

  return (
    <Stack
      key={theme.dark ? 'dark' : 'light'}
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
