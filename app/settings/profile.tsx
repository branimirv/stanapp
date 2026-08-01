import { Redirect } from 'expo-router';

export default function SettingsProfileRedirect() {
  return <Redirect href="/(tabs)/me/profile" />;
}
