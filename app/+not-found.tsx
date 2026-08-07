import { Link } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Text } from '@/components/ui/text';
import { StackScreenChrome } from '@/components/ui/StackScreenChrome';
import { routes } from '@/lib/routes';

export default function NotFoundScreen() {
  const { t } = useTranslation();

  return (
    <StackScreenChrome title={t('errors.notFound')}>
      <View className="flex-1 items-center justify-center p-5">
        <Text className="text-xl font-semibold">{t('errors.notFound')}</Text>
        <Link href={routes.home} className="mt-4 py-4">
          <Text className="text-primary text-sm">{t('common.goHome')}</Text>
        </Link>
      </View>
    </StackScreenChrome>
  );
}
