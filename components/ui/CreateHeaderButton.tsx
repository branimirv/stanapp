import { Plus } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'react-native-paper';

import { HeaderIconButton } from '@/components/ui/HeaderIconButton';

interface CreateHeaderButtonProps {
  onPress: () => void;
}

export function CreateHeaderButton({ onPress }: CreateHeaderButtonProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <HeaderIconButton
      icon={Plus}
      onPress={onPress}
      accessibilityLabel={t('properties.addNew')}
      color={theme.colors.primary}
    />
  );
}
