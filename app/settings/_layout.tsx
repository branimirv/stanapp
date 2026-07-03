import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'react-native-paper';

import { HeaderBackButton } from '@/components/ui/HeaderBackButton';
import { useThemedStackScreenOptions } from '@/hooks/useThemedStackScreenOptions';

export default function SettingsLayout() {
  const { t } = useTranslation();
  const theme = useTheme();
  const screenOptions = useThemedStackScreenOptions();

  return (
    <Stack key={theme.dark ? 'dark' : 'light'} screenOptions={screenOptions}>
      <Stack.Screen
        name="index"
        options={{ title: t('settings.title'), headerLeft: () => <HeaderBackButton /> }}
      />
      <Stack.Screen name="profile" options={{ title: t('settings.editProfile') }} />
      <Stack.Screen name="notifications" options={{ title: t('settings.notificationPreferences') }} />
    </Stack>
  );
}
