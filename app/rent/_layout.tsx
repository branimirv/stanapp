import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'react-native-paper';

import { useThemedStackScreenOptions } from '@/hooks/useThemedStackScreenOptions';

export default function RentLayout() {
  const { t } = useTranslation();
  const theme = useTheme();
  const screenOptions = useThemedStackScreenOptions({ showSettings: true });

  return (
    <Stack key={theme.dark ? 'dark' : 'light'} screenOptions={screenOptions}>
      <Stack.Screen name="[id]" options={{ title: t('rent.paymentDetails') }} />
      <Stack.Screen name="new" options={{ title: t('rent.newPayment') }} />
    </Stack>
  );
}
