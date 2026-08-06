import { Stack, usePathname } from 'expo-router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { TabScreenBackground } from '@/components/ui/AppScreenBackground';
import { tabRootScreenOptions } from '@/constants/header';
import { useAppHeaderOptions } from '@/hooks/useAppHeaderOptions';
import { useTabBarStore } from '@/stores/tabBarStore';

/** True only on Me stack children (profile / team / notifications), not Me root. */
function isNestedMeRoute(pathname: string): boolean {
  const segments = pathname.replace(/\/$/, '').split('/').filter(Boolean);
  const meIndex = segments.lastIndexOf('me');
  if (meIndex < 0) return false;
  return meIndex < segments.length - 1;
}

export default function MeTabLayout() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const setChromeHidden = useTabBarStore((s) => s.setChromeHidden);
  const screenOptions = useAppHeaderOptions({ variant: 'tabRoot' });

  // Hide NativeTabs only on nested Me screens. Setting false for every other
  // path also clears a stuck hidden state if we left Me via another tab.
  useEffect(() => {
    setChromeHidden(isNestedMeRoute(pathname));
  }, [pathname, setChromeHidden]);

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
