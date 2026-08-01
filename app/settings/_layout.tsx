import { Stack } from 'expo-router';

/**
 * Compatibility redirects for old `/settings/*` paths.
 * Real screens live under `/(tabs)/me`.
 */
export default function SettingsRedirectLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
