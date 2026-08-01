import { Plus, Search, type LucideIcon } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'react-native-paper';

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
  active,
  expanded,
}: HeaderActionProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  if (preset === 'create') {
    return (
      <HeaderIconButton
        icon={Plus}
        onPress={onPress!}
        accessibilityLabel={accessibilityLabel ?? t('properties.addNew')}
        color={color ?? theme.colors.primary}
      />
    );
  }

  if (preset === 'search') {
    const searchColor =
      color ?? (active || expanded ? theme.colors.primary : theme.colors.onSurface);

    return (
      <HeaderIconButton
        icon={Search}
        onPress={onPress!}
        accessibilityLabel={accessibilityLabel ?? t('common.search')}
        color={searchColor}
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
