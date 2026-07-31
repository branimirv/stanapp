import { Stack } from 'expo-router';

import { useAppHeaderOptions } from '@/hooks/useAppHeaderOptions';

export default function DevLayout() {
  const screenOptions = useAppHeaderOptions();

  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen name="nav-audit" options={{ title: 'Nav audit' }} />
    </Stack>
  );
}
