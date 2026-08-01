import { Redirect } from 'expo-router';

export default function SettingsNotificationsRedirect() {
  return <Redirect href="/(tabs)/me/notifications" />;
}
