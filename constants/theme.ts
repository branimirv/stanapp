export const Colors = {
  // Brand
  primary: '#2563EB',
  primaryLight: '#DBEAFE',
  accent: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',

  // Surfaces (Light mode)
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceVariant: '#F1F5F9',
  border: '#E2E8F0',

  // Surfaces (Dark mode) — true black / Revolut-inspired
  backgroundDark: '#000000',
  surfaceDark: '#121212',
  surfaceVariantDark: '#1C1C1E',
  borderDark: '#2A2A2C',

  // Text
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  textDisabled: '#CBD5E1',
  textInverse: '#FFFFFF',

  // Status
  statusPaid: '#10B981',
  statusPending: '#F59E0B',
  statusLate: '#EF4444',
  statusPartial: '#8B5CF6',

  // Property types
  typeApartment: '#2563EB',
  typeHouse: '#10B981',
  typeGarage: '#6B7280',
  typeOther: '#8B5CF6',
} as const;

export const Typography = {
  displayLarge: { fontSize: 32, fontWeight: '700' as const, lineHeight: 40 },
  displayMedium: { fontSize: 28, fontWeight: '700' as const, lineHeight: 36 },
  headlineLarge: { fontSize: 24, fontWeight: '600' as const, lineHeight: 32 },
  headlineMedium: { fontSize: 20, fontWeight: '600' as const, lineHeight: 28 },
  titleLarge: { fontSize: 18, fontWeight: '600' as const, lineHeight: 26 },
  titleMedium: { fontSize: 16, fontWeight: '500' as const, lineHeight: 24 },
  bodyLarge: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  bodyMedium: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  bodySmall: { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },
  labelLarge: { fontSize: 14, fontWeight: '500' as const, lineHeight: 20 },
  labelMedium: { fontSize: 12, fontWeight: '500' as const, lineHeight: 16 },
  labelSmall: { fontSize: 11, fontWeight: '500' as const, lineHeight: 14 },
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

/** App theme shape (Paper-compatible colors for gradual migration leftovers). */
export type AppThemeColors = {
  primary: string;
  primaryContainer: string;
  secondary: string;
  secondaryContainer: string;
  background: string;
  surface: string;
  surfaceVariant: string;
  error: string;
  onPrimary: string;
  onSecondary: string;
  onBackground: string;
  onSurface: string;
  onSurfaceVariant: string;
  outline: string;
};

export type AppTheme = {
  dark: boolean;
  colors: AppThemeColors;
  roundness: number;
};

export const lightTheme: AppTheme = {
  dark: false,
  colors: {
    primary: Colors.primary,
    primaryContainer: Colors.primaryLight,
    secondary: Colors.accent,
    secondaryContainer: '#D1FAE5',
    background: Colors.background,
    surface: Colors.surface,
    surfaceVariant: Colors.surfaceVariant,
    error: Colors.danger,
    onPrimary: Colors.textInverse,
    onSecondary: Colors.textInverse,
    onBackground: Colors.textPrimary,
    onSurface: Colors.textPrimary,
    onSurfaceVariant: Colors.textSecondary,
    outline: Colors.border,
  },
  roundness: 12,
};

export const darkTheme: AppTheme = {
  dark: true,
  colors: {
    primary: Colors.primary,
    primaryContainer: '#1E3A8A',
    secondary: Colors.accent,
    secondaryContainer: '#064E3B',
    background: Colors.backgroundDark,
    surface: Colors.surfaceDark,
    surfaceVariant: Colors.surfaceVariantDark,
    error: Colors.danger,
    onPrimary: Colors.textInverse,
    onSecondary: Colors.textInverse,
    onBackground: Colors.textInverse,
    onSurface: Colors.textInverse,
    onSurfaceVariant: '#9CA3AF',
    outline: Colors.borderDark,
  },
  roundness: 12,
};
