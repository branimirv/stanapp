import { Link, Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import { Colors } from '@/constants/theme';

export default function NotFoundScreen() {
  const { t } = useTranslation();

  return (
    <>
      <Stack.Screen options={{ title: t('errors.notFound') }} />
      <View style={styles.container}>
        <Text variant="headlineSmall">{t('errors.notFound')}</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>{t('common.goHome')}</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: Colors.background,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontSize: 14,
    color: Colors.primary,
  },
});
