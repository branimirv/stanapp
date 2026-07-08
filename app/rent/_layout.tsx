import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { EntityStack } from '@/components/navigation/EntityStack';

export default function RentLayout() {
  const { t } = useTranslation();

  return (
    <EntityStack>
      <Stack.Screen name="[id]" options={{ title: t('rent.paymentDetails') }} />
      <Stack.Screen name="new" options={{ title: t('rent.newPayment') }} />
    </EntityStack>
  );
}
