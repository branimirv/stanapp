/**
 * lib/theme.ts
 *
 * Runtime theme objects + React Navigation themes + chart helpers.
 * Invents nothing — every value is read from constants/theme.ts.
 *
 * Preference / Uniwind / hydration live in hooks/useAppTheme.ts — that is the
 * only useAppTheme in the app.
 */

import { DarkTheme, DefaultTheme, type Theme } from 'expo-router/react-navigation';

import {
  DARK,
  LIGHT,
  Elevation,
  Radius,
  Spacing,
  Typography,
  type Palette,
} from '@/constants/theme';

export type ThemeName = 'dark' | 'light';

export interface AppTheme {
  name: ThemeName;
  colors: Palette;
  radius: typeof Radius;
  spacing: typeof Spacing;
  elevation: (typeof Elevation)['dark'];
  typography: Omit<typeof Typography, 'displayWeight'> & {
    /** Already resolved for the active theme — '500' dark, '600' light. */
    displayWeight: '500' | '600';
  };
}

function build(name: ThemeName): AppTheme {
  const colors = name === 'dark' ? DARK : LIGHT;
  return {
    name,
    colors,
    radius: Radius,
    spacing: Spacing,
    elevation: Elevation[name],
    typography: {
      ...Typography,
      displayWeight: Typography.displayWeight[name],
    },
  };
}

export const THEMES: Record<ThemeName, AppTheme> = {
  dark: build('dark'),
  light: build('light'),
};

/* ============================================================================
   REACT NAVIGATION
   Wired so pushed screens and the native tab bar pick up brand colours.
   Themes come from expo-router (this app does not depend on
   @react-navigation/native as a direct package).
   ============================================================================ */

export const NAV_THEME: Record<ThemeName, Theme> = {
  dark: {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: DARK.bg,
      card: DARK.surface,
      text: DARK.fg,
      border: DARK.bd,
      primary: DARK.primary,
      notification: DARK.neg,
    },
  },
  light: {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: LIGHT.bg,
      card: LIGHT.surface,
      text: LIGHT.fg,
      border: LIGHT.bd,
      primary: LIGHT.primary,
      notification: LIGHT.neg,
    },
  },
};

/* ============================================================================
   CHART HELPERS  (react-native-gifted-charts)

   gifted-charts takes colours as props, so charts must read from the JS
   theme rather than className. These keep the two Analitika charts
   consistent with the mockup.
   ============================================================================ */

/** Area+line chart used for "Neto novčani tok". */
export function lineChartTheme(t: AppTheme) {
  return {
    color: t.colors.primary,
    thickness: 2,
    curved: true,
    areaChart: true,
    startFillColor: t.colors.primary,
    endFillColor: t.colors.primary,
    startOpacity: 0.18,
    endOpacity: 0.02,
    hideDataPoints: true,
    hideRules: true,
    hideYAxisText: true,
    yAxisThickness: 0,
    xAxisThickness: 0,
    /** X labels are eyebrow-styled: 10px / 600 / .08em / uppercase / muted. */
    xAxisLabelTextStyle: {
      fontFamily: t.typography.fontFamily.sans,
      fontSize: t.typography.eyebrow.sm.size,
      fontWeight: t.typography.eyebrow.sm.weight,
      letterSpacing: t.typography.eyebrow.sm.letterSpacing,
      textTransform: t.typography.eyebrow.sm.textTransform,
      color: t.colors.muted,
    },
  };
}

/**
 * Colour for a categorical series by slot index (0..5).
 * Always go through this rather than indexing `chart` directly — it keeps the
 * out-of-range case loud instead of rendering `undefined` as black.
 */
export function chartColor(t: AppTheme, slot: number): string {
  const c = t.colors.chart[slot];
  if (!c) throw new Error(`chartColor: slot ${slot} out of range (0-5)`);
  return c;
}

export function chartTint(t: AppTheme, slot: number): string {
  const c = t.colors.chartTint[slot];
  if (!c) throw new Error(`chartTint: slot ${slot} out of range (0-5)`);
  return c;
}
