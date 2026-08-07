import { Redirect } from 'expo-router';

import { routes } from '@/lib/routes';

export default function SettingsProfileRedirect() {
  return <Redirect href={routes.tabs.me.profile} />;
}
