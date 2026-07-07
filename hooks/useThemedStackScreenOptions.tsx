import { useTheme } from 'react-native-paper';

import { HeaderBackButton } from '@/components/ui/HeaderBackButton';
import { HeaderSettingsActions } from '@/components/ui/HeaderSettingsActions';
import { Colors } from '@/constants/theme';
import {
  headerBarStyle,
  headerLeftContainerStyle,
  headerRightContainerStyle,
} from '@/constants/header';

interface ThemedStackScreenOptions {
  showSettings?: boolean;
}

export function useThemedStackScreenOptions({
  showSettings = false,
}: ThemedStackScreenOptions = {}) {
  const theme = useTheme();

  return {
    headerStyle: {
      backgroundColor: theme.dark ? Colors.backgroundDark : Colors.surface,
      ...headerBarStyle,
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
    ...(showSettings && {
      headerRight: () => <HeaderSettingsActions />,
    }),
  };
}
