import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { tabRootScreenOptions } from '@/constants/header';
import { useAppHeaderOptions } from '@/hooks/useAppHeaderOptions';
import { useAppTheme } from '@/hooks/useAppTheme';

export default function ReportsTabLayout() {
  const { t } = useTranslation();
  const { isDark } = useAppTheme();
  const headerOptions = useAppHeaderOptions({ variant: 'tabRoot' });

  return (
    <Stack key={isDark ? 'dark' : 'light'} screenOptions={headerOptions}>
      <Stack.Screen name="index" options={tabRootScreenOptions(t('tabs.reports'))} />
    </Stack>
  );
}
