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

/** Translucent Android NativeTabs chrome (content peeks through). */
export const ANDROID_TAB_BAR_BG_DARK = 'rgba(18, 18, 18, 0.88)';
export const ANDROID_TAB_BAR_BG_LIGHT = 'rgba(255, 255, 255, 0.92)';
