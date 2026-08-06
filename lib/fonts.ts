/**
 * Font family names registered via expo-font in app/_layout.
 * Defaults match Typography.fontFamily (Inter / Fraunces).
 * Weight-specific names are used when StyleSheet needs an exact static file.
 */
export const Fonts = {
  sans: {
    regular: 'Inter',
    medium: 'Inter_500Medium',
    semibold: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',
  },
  display: {
    medium: 'Fraunces',
    semibold: 'Fraunces_600SemiBold',
  },
} as const;

/** Fraunces face for the active theme (500 dark / 600 light). */
export function displayFontFamily(themeName: 'dark' | 'light') {
  return themeName === 'dark' ? Fonts.display.medium : Fonts.display.semibold;
}
