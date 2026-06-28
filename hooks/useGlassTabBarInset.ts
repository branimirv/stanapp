import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  getGlassTabBarFabBottom,
  getGlassTabBarScrollPadding,
} from '@/components/ui/GlassTabBar';

export function useGlassTabBarInset() {
  const insets = useSafeAreaInsets();

  return {
    scrollPadding: getGlassTabBarScrollPadding(insets.bottom),
    fabBottom: getGlassTabBarFabBottom(insets.bottom),
  };
}
