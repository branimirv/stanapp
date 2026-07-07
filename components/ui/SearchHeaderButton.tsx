import { Search } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'react-native-paper';

import { HeaderIconButton } from '@/components/ui/HeaderIconButton';

interface SearchHeaderButtonProps {
  active?: boolean;
  expanded?: boolean;
  onPress: () => void;
}

export function SearchHeaderButton({ active, expanded, onPress }: SearchHeaderButtonProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  const color = active || expanded ? theme.colors.primary : theme.colors.onSurface;

  return (
    <HeaderIconButton
      icon={Search}
      onPress={onPress}
      accessibilityLabel={t('common.search')}
      color={color}
    />
  );
}
