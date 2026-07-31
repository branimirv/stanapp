import { useTheme } from 'react-native-paper';

import { HeaderBackButton } from '@/components/ui/HeaderBackButton';
import { HeaderActionsPill } from '@/components/ui/HeaderActionsPill';
import { SettingsHeaderButton } from '@/components/ui/SettingsHeaderButton';
import {
  headerBarStyle,
  headerLeftContainerStyle,
  headerRightContainerStyle,
} from '@/constants/header';
import { Colors, Typography } from '@/constants/theme';

export type AppHeaderVariant = 'tabRoot' | 'stack';

interface UseAppHeaderOptionsParams {
  variant?: AppHeaderVariant;
  /** When true, stack screens get a glass settings pill unless `headerRight` is overridden per screen. */
  showDefaultSettings?: boolean;
}

export function useAppHeaderOptions({
  variant = 'stack',
  showDefaultSettings = false,
}: UseAppHeaderOptionsParams = {}) {
  const theme = useTheme();

  const defaultSettingsRight = () => (
    <HeaderActionsPill>
      <SettingsHeaderButton />
    </HeaderActionsPill>
  );

  const showSettingsOnTabRoot = variant === 'tabRoot';
  const showSettingsOnStack = variant === 'stack' && showDefaultSettings;

  return {
    headerStyle: {
      backgroundColor: theme.dark ? Colors.backgroundDark : Colors.surface,
      ...headerBarStyle,
    },
    headerTitleStyle: {
      ...Typography.titleLarge,
      color: theme.colors.onSurface,
    },
    headerTintColor: theme.colors.onSurface,
    headerTitleAlign: 'left' as const,
    headerBackTitleVisible: false,
    headerBackVisible: false,
    headerLeft: () => <HeaderBackButton />,
    headerLeftContainerStyle,
    headerRightContainerStyle,
    headerShadowVisible: false,
    contentStyle: {
      backgroundColor: theme.colors.background,
    },
    ...(showSettingsOnTabRoot || showSettingsOnStack
      ? { headerRight: defaultSettingsRight }
      : {}),
  };
}
