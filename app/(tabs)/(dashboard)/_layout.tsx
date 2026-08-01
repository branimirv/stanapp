import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'react-native-paper';

import { useAppHeaderOptions } from '@/hooks/useAppHeaderOptions';

export default function DashboardTabLayout() {
  const { t } = useTranslation();
  const theme = useTheme();
  const headerOptions = useAppHeaderOptions({ variant: 'tabRoot' });

  return (
    <Stack key={theme.dark ? 'dark' : 'light'} screenOptions={headerOptions}>
      <Stack.Screen name="index" options={{ title: t('tabs.dashboard') }} />
    </Stack>
  );
}
