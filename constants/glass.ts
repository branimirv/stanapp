export function getGlassOverlayColor(isDark: boolean) {
  return isDark ? 'rgba(22, 22, 24, 0.8)' : 'rgba(255, 255, 255, 0.72)';
}

export function getGlassBorderColor(isDark: boolean) {
  return isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.65)';
}

export function getGlassGlossColors(isDark: boolean): [string, string] {
  return isDark
    ? ['rgba(255, 255, 255, 0.12)', 'rgba(255, 255, 255, 0)']
    : ['rgba(255, 255, 255, 0.55)', 'rgba(255, 255, 255, 0)'];
}

export function getGlassBlurIntensity(isDark: boolean) {
  return isDark ? 36 : 52;
}

export function getGlassBlurTint(isDark: boolean): 'dark' | 'light' {
  return isDark ? 'dark' : 'light';
}

export function getGlassActiveIndicatorColor(isDark: boolean) {
  return isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(15, 23, 42, 0.08)';
}
