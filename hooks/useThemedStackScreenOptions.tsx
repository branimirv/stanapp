import { useTheme } from 'react-native-paper';

import { SettingsHeaderButton } from '@/components/ui/SettingsHeaderButton';
import { Colors } from '@/constants/theme';

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
    },
    headerTintColor: theme.colors.onSurface,
    headerShadowVisible: false,
    contentStyle: {
      backgroundColor: theme.colors.background,
    },
    ...(showSettings && {
      headerRight: () => <SettingsHeaderButton />,
    }),
  };
}
