import { Redirect } from 'expo-router';

import { routes } from '@/lib/routes';

export default function SettingsNotificationsRedirect() {
  return <Redirect href={routes.tabs.me.notifications} />;
}
