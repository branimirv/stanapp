import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import { Colors, Spacing } from '@/constants/theme';
import { useAuthStore } from '@/stores/authStore';

export default function Index() {
  const { t } = useTranslation();
  const session = useAuthStore((state) => state.session);
  const isLoading = useAuthStore((state) => state.isLoading);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text variant="bodyMedium" style={styles.loadingText}>
          {t('common.loading')}
        </Text>
      </View>
    );
  }

  if (session) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)/login" />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.background,
  },
  loadingText: {
    color: Colors.textSecondary,
  },
});
