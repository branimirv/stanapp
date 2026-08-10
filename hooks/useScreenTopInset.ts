import { Platform, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** Extra breathing room under the status bar — Android only. */
const ANDROID_TOP_GAP = 8;

/**
 * Top safe inset for edge-to-edge screens.
 *
 * On Android, NativeTabs + edge-to-edge often report `insets.top` as 0, which
 * puts floating chrome and titles under the system status bar. Fall back to
 * `StatusBar.currentHeight` and add a small gap for tap comfort.
 *
 * iOS keeps relying on safe-area insets (+ ScrollView automatic adjustment).
 */
export function useScreenTopInset(): number {
  const insets = useSafeAreaInsets();

  if (Platform.OS !== 'android') {
    return insets.top;
  }

  const statusBar = StatusBar.currentHeight ?? 0;
  return Math.max(insets.top, statusBar) + ANDROID_TOP_GAP;
}
