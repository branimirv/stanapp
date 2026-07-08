import { router } from 'expo-router';
import { Plus, Search, Settings, type LucideIcon } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'react-native-paper';

import { HeaderIconButton } from '@/components/ui/HeaderIconButton';

type HeaderActionPreset = 'create' | 'search' | 'settings';

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

  if (preset === 'settings') {
    return (
      <HeaderIconButton
        icon={Settings}
        onPress={onPress ?? (() => router.push('/settings'))}
        accessibilityLabel={accessibilityLabel ?? t('settings.title')}
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
