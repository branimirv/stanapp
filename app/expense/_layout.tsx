import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { EntityStack } from '@/components/navigation/EntityStack';

export default function ExpenseLayout() {
  const { t } = useTranslation();

  return (
    <EntityStack>
      <Stack.Screen name="[id]" options={{ title: t('expenses.expenseDetails') }} />
      <Stack.Screen name="new" options={{ title: t('expenses.newExpense') }} />
      <Stack.Screen
        name="edit/[id]"
        options={{
          title: t('expenses.editExpense'),
          headerRight: () => null,
        }}
      />
    </EntityStack>
  );
}
