export type AppHeaderVariant = 'tabRoot' | 'stack';

interface UseAppHeaderOptionsParams {
  variant?: AppHeaderVariant;
}

/**
 * Native header is hidden for both tab roots and pushed stacks.
 * Screens render FloatingScreenActions / FloatingStackHeader instead.
 * Screen fill stays transparent so root `ScreenAmbient` shows through.
 */
export function useAppHeaderOptions({
  variant: _variant = 'stack',
}: UseAppHeaderOptionsParams = {}) {
  return {
    headerShown: false,
    contentStyle: {
      backgroundColor: 'transparent',
    },
  };
}
