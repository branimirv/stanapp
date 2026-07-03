import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'react-native-paper';

import { HeaderBackButton } from '@/components/ui/HeaderBackButton';
import { useThemedStackScreenOptions } from '@/hooks/useThemedStackScreenOptions';

export default function ExpenseLayout() {
  const { t } = useTranslation();
  const theme = useTheme();
  const screenOptions = useThemedStackScreenOptions({ showSettings: true });

  return (
    <Stack key={theme.dark ? 'dark' : 'light'} screenOptions={screenOptions}>
      <Stack.Screen
        name="[id]"
        options={{ title: t('expenses.expenseDetails'), headerLeft: () => <HeaderBackButton /> }}
      />
      <Stack.Screen
        name="new"
        options={{ title: t('expenses.newExpense'), headerLeft: () => <HeaderBackButton /> }}
      />
      <Stack.Screen name="edit/[id]" options={{ title: t('expenses.editExpense') }} />
    </Stack>
  );
}
