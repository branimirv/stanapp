import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { useThemedStackScreenOptions } from '@/hooks/useThemedStackScreenOptions';

export default function SettingsLayout() {
  const { t } = useTranslation();
  const screenOptions = useThemedStackScreenOptions();

  // Don't remount on theme change — remounting reset the theme switcher's
  // segmented indicator to index 0 (Light) while preference stayed Dark.
  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen name="index" options={{ title: t('settings.title') }} />
      <Stack.Screen name="profile" options={{ title: t('settings.editProfile') }} />
      <Stack.Screen name="notifications" options={{ title: t('settings.notificationPreferences') }} />
    </Stack>
  );
}
