import { useAppTheme } from '@/hooks/useAppTheme';

export type AppHeaderVariant = 'tabRoot' | 'stack';

interface UseAppHeaderOptionsParams {
  variant?: AppHeaderVariant;
}

/**
 * Native header is hidden for both tab roots and pushed stacks.
 * Screens render FloatingScreenActions / FloatingStackHeader instead.
 * Screen cards use solid `--bg` so iOS push/pop doesn't ghost through
 * transparent stack layers (property ↔ rent ↔ tenant).
 */
export function useAppHeaderOptions({
  variant: _variant = 'stack',
}: UseAppHeaderOptionsParams = {}) {
  const { theme } = useAppTheme();

  return {
    headerShown: false,
    contentStyle: {
      backgroundColor: theme.colors.bg,
    },
  };
}
