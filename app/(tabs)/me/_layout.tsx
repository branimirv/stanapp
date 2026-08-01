import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { HeaderBackButton } from '@/components/ui/HeaderBackButton';
import { headerLeftContainerStyle, tabRootScreenOptions } from '@/constants/header';
import { useAppHeaderOptions } from '@/hooks/useAppHeaderOptions';

export default function MeTabLayout() {
  const { t } = useTranslation();
  const screenOptions = useAppHeaderOptions({ variant: 'tabRoot' });

  const nestedScreenOptions = {
    headerLeft: () => <HeaderBackButton />,
    headerLeftContainerStyle,
    headerTitleContainerStyle: {},
  };

  // Don't remount on theme change — remounting reset the theme switcher's
  // segmented indicator to index 0 (Light) while preference stayed Dark.
  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen name="index" options={tabRootScreenOptions(t('tabs.me'))} />
      <Stack.Screen
        name="profile"
        options={{ title: t('settings.editProfile'), ...nestedScreenOptions }}
      />
      <Stack.Screen
        name="notifications"
        options={{
          title: t('settings.notificationPreferences'),
          ...nestedScreenOptions,
        }}
      />
    </Stack>
  );
}
