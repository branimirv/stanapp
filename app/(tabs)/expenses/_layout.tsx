import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { TabScreenBackground } from '@/components/ui/AppScreenBackground';
import { tabRootScreenOptions } from '@/constants/header';
import { useAppHeaderOptions } from '@/hooks/useAppHeaderOptions';
import { useAppTheme } from '@/hooks/useAppTheme';

export default function ExpensesTabLayout() {
  const { t } = useTranslation();
  const { isDark } = useAppTheme();
  const headerOptions = useAppHeaderOptions({ variant: 'tabRoot' });

  return (
    <TabScreenBackground>
      <Stack key={isDark ? 'dark' : 'light'} screenOptions={headerOptions}>
        <Stack.Screen name="index" options={tabRootScreenOptions(t('tabs.expenses'))} />
      </Stack>
    </TabScreenBackground>
  );
}
