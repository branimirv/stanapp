export function getGlassOverlayColor(isDark: boolean) {
  // Keep overlays light so BlurView/liquid refraction stays readable.
  return isDark ? 'rgba(22, 22, 24, 0.42)' : 'rgba(255, 255, 255, 0.45)';
}

export function getGlassBorderColor(isDark: boolean) {
  return isDark ? 'rgba(255, 255, 255, 0.18)' : 'rgba(255, 255, 255, 0.7)';
}

export function getGlassGlossColors(isDark: boolean): [string, string] {
  return isDark
    ? ['rgba(255, 255, 255, 0.16)', 'rgba(255, 255, 255, 0)']
    : ['rgba(255, 255, 255, 0.6)', 'rgba(255, 255, 255, 0)'];
}

export function getGlassBlurIntensity(isDark: boolean) {
  return isDark ? 48 : 64;
}

export function getGlassBlurTint(isDark: boolean): 'dark' | 'light' {
  return isDark ? 'dark' : 'light';
}

export function getGlassActiveIndicatorColor(isDark: boolean) {
  return isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(15, 23, 42, 0.08)';
}
