import { Redirect } from 'expo-router';

import { routes } from '@/lib/routes';

export default function SettingsRedirect() {
  return <Redirect href={routes.tabs.me.index} />;
}
