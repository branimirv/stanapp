import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Text } from '@/components/ui/text';
import { Colors } from '@/constants/theme';
import { useAuthStore } from '@/stores/authStore';

export default function Index() {
  const { t } = useTranslation();
  const session = useAuthStore((state) => state.session);
  const isLoading = useAuthStore((state) => state.isLoading);

  if (isLoading) {
    return (
      <View className="bg-background flex-1 items-center justify-center gap-4">
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text className="text-muted-foreground text-sm">{t('common.loading')}</Text>
      </View>
    );
  }

  if (session) {
    return <Redirect href="/(tabs)/(dashboard)" />;
  }

  return <Redirect href="/(auth)/login" />;
}
