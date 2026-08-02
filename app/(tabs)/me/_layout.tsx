import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { TabScreenBackground } from '@/components/ui/AppScreenBackground';
import { tabRootScreenOptions } from '@/constants/header';
import { useAppHeaderOptions } from '@/hooks/useAppHeaderOptions';

export default function MeTabLayout() {
  const { t } = useTranslation();
  const screenOptions = useAppHeaderOptions({ variant: 'tabRoot' });

  // Don't remount on theme change — remounting reset the theme switcher's
  // segmented indicator to index 0 (Light) while preference stayed Dark.
  return (
    <TabScreenBackground>
      <Stack screenOptions={screenOptions}>
        <Stack.Screen name="index" options={tabRootScreenOptions(t('tabs.me'))} />
        <Stack.Screen name="profile" options={{ title: t('settings.editProfile') }} />
        <Stack.Screen name="team" options={{ title: t('members.teamTitle') }} />
        <Stack.Screen
          name="notifications"
          options={{ title: t('settings.notificationPreferences') }}
        />
      </Stack>
    </TabScreenBackground>
  );
}
