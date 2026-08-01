import { useTheme } from 'react-native-paper';

import { HeaderBackButton } from '@/components/ui/HeaderBackButton';
import {
  HEADER_EDGE_INSET,
  headerBarStyle,
  headerLeftContainerStyle,
  headerRightContainerStyle,
} from '@/constants/header';
import { Colors, Typography } from '@/constants/theme';

export type AppHeaderVariant = 'tabRoot' | 'stack';

interface UseAppHeaderOptionsParams {
  variant?: AppHeaderVariant;
}

export function useAppHeaderOptions({
  variant = 'stack',
}: UseAppHeaderOptionsParams = {}) {
  const theme = useTheme();
  const isTabRoot = variant === 'tabRoot';

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
    // Tab roots omit headerLeft entirely — router.canGoBack() is often true after
    // auth, which previously left an empty glass circle on iOS and centered the title.
    ...(isTabRoot
      ? {
          headerTitleContainerStyle: { paddingLeft: HEADER_EDGE_INSET },
        }
      : {
          headerLeft: () => <HeaderBackButton />,
          headerLeftContainerStyle,
        }),
    headerRightContainerStyle,
    headerShadowVisible: false,
    contentStyle: {
      backgroundColor: theme.colors.background,
    },
  };
}
