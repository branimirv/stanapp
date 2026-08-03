import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { LoginScreen } from '@/components/auth/LoginScreen';
import { Text } from '@/components/ui/text';
import { Colors } from '@/constants/theme';
import { useAuthStore } from '@/stores/authStore';

/**
 * Entry route. Renders login in-place when signed out (no nested Redirect),
 * which avoids blank screens after NativeTabs unmount / Stack.Protected.
 */
export default function Index() {
  const { t } = useTranslation();
  const session = useAuthStore((state) => state.session);
  const isLoading = useAuthStore((state) => state.isLoading);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text className="text-muted-foreground text-sm">{t('common.loading')}</Text>
      </View>
    );
  }

  if (session) {
    return <Redirect href="/(tabs)/(dashboard)" />;
  }

  return <LoginScreen />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    backgroundColor: 'transparent',
  },
});
