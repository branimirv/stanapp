import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'react-native-paper';

import { HeaderBackButton } from '@/components/ui/HeaderBackButton';
import { useThemedStackScreenOptions } from '@/hooks/useThemedStackScreenOptions';

export default function PropertyLayout() {
  const { t } = useTranslation();
  const theme = useTheme();
  const screenOptions = useThemedStackScreenOptions({ showSettings: true });

  return (
    <Stack key={theme.dark ? 'dark' : 'light'} screenOptions={screenOptions}>
      <Stack.Screen
        name="[id]"
        options={{ title: t('properties.propertyDetails'), headerLeft: () => <HeaderBackButton /> }}
      />
      <Stack.Screen
        name="new"
        options={{ title: t('properties.newProperty'), headerLeft: () => <HeaderBackButton /> }}
      />
      <Stack.Screen name="edit/[id]" options={{ title: t('properties.editProperty') }} />
    </Stack>
  );
}
