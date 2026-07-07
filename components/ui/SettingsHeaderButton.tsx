import { router } from 'expo-router';
import { Settings } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { HeaderIconButton } from '@/components/ui/HeaderIconButton';

export function SettingsHeaderButton() {
  const { t } = useTranslation();

  return (
    <HeaderIconButton
      icon={Settings}
      onPress={() => router.push('/settings')}
      accessibilityLabel={t('settings.title')}
    />
  );
}
