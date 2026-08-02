import { Plus, Search, type LucideIcon } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { HeaderIconButton } from '@/components/ui/HeaderIconButton';

type HeaderActionPreset = 'create' | 'search';

interface HeaderActionProps {
  preset?: HeaderActionPreset;
  icon?: LucideIcon;
  onPress?: () => void;
  accessibilityLabel?: string;
  color?: string;
  active?: boolean;
  expanded?: boolean;
}

export function HeaderAction({
  preset,
  icon,
  onPress,
  accessibilityLabel,
  color,
}: HeaderActionProps) {
  const { t } = useTranslation();

  if (preset === 'create') {
    return (
      <HeaderIconButton
        icon={Plus}
        onPress={onPress!}
        accessibilityLabel={accessibilityLabel ?? t('properties.addNew')}
        color={color}
      />
    );
  }

  if (preset === 'search') {
    return (
      <HeaderIconButton
        icon={Search}
        onPress={onPress!}
        accessibilityLabel={accessibilityLabel ?? t('common.search')}
        color={color}
      />
    );
  }

  if (!icon || !onPress) return null;

  return (
    <HeaderIconButton
      icon={icon}
      onPress={onPress}
      accessibilityLabel={accessibilityLabel ?? ''}
      color={color}
    />
  );
}
