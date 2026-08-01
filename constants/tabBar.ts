import { Platform } from 'react-native';

/**
 * Approximate native tab bar height used for overlays that sit above it
 * (e.g. Toast). Native tabs do not expose a measurable height.
 */
export const NATIVE_TAB_BAR_OFFSET = Platform.select({
  ios: 49,
  android: 80,
  default: 56,
})!;
