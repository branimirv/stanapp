import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'react-native-paper';

import { useThemedStackScreenOptions } from '@/hooks/useThemedStackScreenOptions';

export default function PropertyLayout() {
  const { t } = useTranslation();
  const theme = useTheme();
  const screenOptions = useThemedStackScreenOptions();

  return (
    <Stack key={theme.dark ? 'dark' : 'light'} screenOptions={screenOptions}>
      <Stack.Screen name="[id]" options={{ title: t('properties.propertyDetails') }} />
      <Stack.Screen name="new" options={{ title: t('properties.newProperty') }} />
      <Stack.Screen name="edit/[id]" options={{ title: t('properties.editProperty') }} />
    </Stack>
  );
}
