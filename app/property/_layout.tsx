import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { EntityStack } from '@/components/navigation/EntityStack';

export default function PropertyLayout() {
  const { t } = useTranslation();

  return (
    <EntityStack>
      <Stack.Screen name="[id]" options={{ title: t('properties.propertyDetails') }} />
      <Stack.Screen name="new" options={{ title: t('properties.newProperty') }} />
      <Stack.Screen
        name="edit/[id]"
        options={{
          title: t('properties.editProperty'),
          headerRight: () => null,
        }}
      />
    </EntityStack>
  );
}
