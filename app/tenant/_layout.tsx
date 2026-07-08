import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { EntityStack } from '@/components/navigation/EntityStack';

export default function TenantLayout() {
  const { t } = useTranslation();

  return (
    <EntityStack>
      <Stack.Screen name="[id]" options={{ title: t('tenants.tenantDetails') }} />
      <Stack.Screen name="new" options={{ title: t('tenants.newTenant') }} />
      <Stack.Screen
        name="edit/[id]"
        options={{
          title: t('tenants.editTenant'),
          headerRight: () => null,
        }}
      />
    </EntityStack>
  );
}
