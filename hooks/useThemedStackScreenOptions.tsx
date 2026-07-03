import { useTheme } from 'react-native-paper';

import { HeaderSettingsActions } from '@/components/ui/HeaderSettingsActions';
import { Colors } from '@/constants/theme';
import { headerBarStyle, headerRightContainerStyle } from '@/constants/header';

interface ThemedStackScreenOptions {
  showSettings?: boolean;
}

export function useThemedStackScreenOptions({
  showSettings = false,
}: ThemedStackScreenOptions = {}) {
  const theme = useTheme();

  return {
    headerStyle: {
      backgroundColor: theme.dark ? Colors.surfaceDark : Colors.surface,
      ...headerBarStyle,
    },
    headerTintColor: theme.colors.onSurface,
    headerBackTitleVisible: false,
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
