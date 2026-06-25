import { useTheme } from 'react-native-paper';

import { Colors } from '@/constants/theme';

export function useThemedStackScreenOptions() {
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
  };
}
