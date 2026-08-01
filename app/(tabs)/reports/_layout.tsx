import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'react-native-paper';

import { tabRootScreenOptions } from '@/constants/header';
import { useAppHeaderOptions } from '@/hooks/useAppHeaderOptions';

export default function ReportsTabLayout() {
  const { t } = useTranslation();
  const theme = useTheme();
  const headerOptions = useAppHeaderOptions({ variant: 'tabRoot' });

  return (
    <Stack key={theme.dark ? 'dark' : 'light'} screenOptions={headerOptions}>
      <Stack.Screen name="index" options={tabRootScreenOptions(t('tabs.reports'))} />
    </Stack>
  );
}
