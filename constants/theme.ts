/**
 * constants/theme.ts
 *
 * KUPOLA — final theme. Single direction ("Naslov"); the old `Direction`
 * union and `PALETTES` map are gone.
 *
 * Mirrors global.css exactly — same hex values, same token names.
 * Two sources exist on purpose: Uniwind needs CSS variables for `className`,
 * and RN needs plain JS for anything that can't take a className (chart
 * props, StyleSheet geometry, React Navigation themes, SVG fills).
 *
 * Rule: global.css is authored first, this file mirrors it. Never the reverse.
 */

/* ============================================================================
   PALETTE
   ============================================================================ */

export interface Palette {
  bg: string;
  fg: string;
  muted: string;

  surface: string;
  surface2: string;
  surface3: string;

  bd: string;
  bdStrong: string;
  /** transparent on dark, = bd on light. See note in global.css. */
  cardBd: string;

  primary: string;
  onPrimary: string;
  primaryTint: string;

  pos: string;
  posTint: string;

  neg: string;
  onNeg: string;
  negTint: string;

  track: string;

  glass: string;
  glassEdge: string;
  glassSpec: string;

  /**
   * Categorical chart palette, 6 slots.
   *
   * IMPORTANT — this was a 5-tuple. It is now 6 because the expense-category
   * breakdown on Analitika tracks six categories:
   *   0 Komunalija  1 Struja  2 Popravak  3 Internet  4 Osiguranje  5 Ostalo
   *
   * Slots 0..2 alias primary/pos/neg by design; 3..5 are chart-only hues.
   * If a 7th category is ever added (e.g. "Plin"), widen this AND add
   * --color-chart-7 to both @variant blocks in global.css.
   */
  chart: readonly [string, string, string, string, string, string];
  chartTint: readonly [string, string, string, string, string, string];
}

export const DARK: Palette = {
  bg: '#0B0B0D',
  fg: '#F0EFEA',
  muted: '#7E7F85',

  surface: '#141417',
  surface2: '#1F1F23',
  surface3: '#2C2C31',

  bd: 'rgba(255,255,255,0.11)',
  bdStrong: 'rgba(255,255,255,0.22)',
  cardBd: 'transparent',

  primary: '#5B8FE8',
  onPrimary: '#050E1C',
  primaryTint: 'rgba(91,143,232,0.15)',

  pos: '#5CBE99',
  posTint: 'rgba(92,190,153,0.13)',

  neg: '#E27266',
  onNeg: '#2B0B08',
  negTint: 'rgba(226,114,102,0.13)',

  track: 'rgba(255,255,255,0.10)',

  glass: 'rgba(36,36,40,0.55)',
  glassEdge: 'rgba(255,255,255,0.14)',
  glassSpec: 'rgba(255,255,255,0.10)',

  chart: ['#5B8FE8', '#5CBE99', '#E27266', '#7E7F85', '#D3A55F', '#9B8CE0'],
  chartTint: [
    'rgba(91,143,232,0.15)',
    'rgba(92,190,153,0.13)',
    'rgba(226,114,102,0.13)',
    'rgba(126,127,133,0.16)',
    'rgba(211,165,95,0.16)',
    'rgba(155,140,224,0.17)',
  ],
} as const;

export const LIGHT: Palette = {
  bg: '#F7F6F2',
  fg: '#121114',
  muted: '#5C5D63',

  surface: '#FFFFFF',
  surface2: '#EDECE6',
  surface3: '#E3E1D9',

  bd: 'rgba(18,17,20,0.11)',
  bdStrong: 'rgba(18,17,20,0.22)',
  cardBd: 'rgba(18,17,20,0.11)',

  primary: '#2A5EC0',
  onPrimary: '#FFFFFF',
  primaryTint: 'rgba(42,94,192,0.11)',

  pos: '#1C7355',
  posTint: 'rgba(28,115,85,0.12)',

  neg: '#AC4536',
  onNeg: '#FFFFFF',
  negTint: 'rgba(172,69,54,0.11)',

  track: 'rgba(18,17,20,0.10)',

  glass: 'rgba(255,255,255,0.70)',
  glassEdge: 'rgba(18,17,20,0.10)',
  glassSpec: 'rgba(255,255,255,0.90)',

  chart: ['#2A5EC0', '#1C7355', '#AC4536', '#85868D', '#8A6310', '#6656B8'],
  chartTint: [
    'rgba(42,94,192,0.11)',
    'rgba(28,115,85,0.12)',
    'rgba(172,69,54,0.11)',
    'rgba(133,134,141,0.14)',
    'rgba(138,99,16,0.12)',
    'rgba(102,86,184,0.13)',
  ],
} as const;

/* ============================================================================
   TYPOGRAPHY

   Two families, strictly divided:
     Inter    — everything interactive, every label, every list row, all body
                copy, and the uppercase eyebrows.
     Fraunces — money figures, screen titles, section headings. Nothing else.

   If you're unsure which to use, it's Inter.
   ============================================================================ */

export const Typography = {
  fontFamily: {
    sans: 'Inter',
    display: 'Fraunces',
  },

  /**
   * Fraunces weight, per theme. THE ONLY NON-COLOUR TOKEN THAT VARIES BY
   * THEME. Light text on a dark ground optically thickens, dark-on-light
   * thins — so the display face steps down on dark and up on light to keep
   * apparent weight constant.
   *
   * Consume via useAppTheme().typography.displayWeight, never hardcode '500'.
   */
  displayWeight: {
    dark: '500' as const,
    light: '600' as const,
  },

  /**
   * Display (Fraunces) sizes actually used in the mockup.
   * Fraunces is wider than most serifs at the same px — these are already
   * reduced from the first pass to stop "1.300 EUR" touching a card edge on
   * a 306px-wide screen.
   */
  display: {
    hero: { size: 46, lineHeight: 46, letterSpacing: -0.92 },   // Početna net income
    heroSm: { size: 42, lineHeight: 42, letterSpacing: -0.84 }, // Analitika net flow
    screenTitle: { size: 34, lineHeight: 34, letterSpacing: -0.68 },
    screenTitleSm: { size: 32, lineHeight: 35, letterSpacing: -0.64 }, // form titles / greeting
    amountLg: { size: 28, lineHeight: 28, letterSpacing: -0.56 },
    amountMd: { size: 26, lineHeight: 29, letterSpacing: -0.52 },
    propertyName: { size: 24, lineHeight: 26, letterSpacing: -0.6 },
    sectionHead: { size: 22, lineHeight: 24, letterSpacing: -0.55 },
    amountSm: { size: 23, lineHeight: 23, letterSpacing: -0.46 },
    bayFigure: { size: 21, lineHeight: 21, letterSpacing: -0.42 },
    rowFigure: { size: 18, lineHeight: 18, letterSpacing: -0.36 },
    listFigure: { size: 18, lineHeight: 18, letterSpacing: -0.36 },
    catFigure: { size: 14, lineHeight: 14, letterSpacing: -0.28 },
  },

  /** Body / UI (Inter). */
  text: {
    modalTitle: { size: 18, weight: '700' as const, letterSpacing: -0.18 },
    rowTitle: { size: 16, weight: '600' as const },
    input: { size: 16, weight: '400' as const },
    button: { size: 15, weight: '600' as const, letterSpacing: -0.15 },
    selectValue: { size: 15, weight: '600' as const },
    listRow: { size: 15, weight: '600' as const },
    settingsRow: { size: 15, weight: '500' as const },
    fieldLabel: { size: 13, weight: '600' as const },
    body: { size: 13.5, weight: '400' as const, lineHeight: 20 },
    pill: { size: 13, weight: '600' as const, letterSpacing: -0.13 },
    segment: { size: 13, weight: '600' as const },
    chip: { size: 12, weight: '600' as const, letterSpacing: -0.06 },
    chipSm: { size: 11, weight: '600' as const },
    caption: { size: 12.5, weight: '400' as const },
    catShare: { size: 10.5, weight: '400' as const },
    countBadge: { size: 10, weight: '700' as const },
  },

  /**
   * Uppercase eyebrow labels. Inter is wider than the Archivo Narrow this
   * originally used, so tracking dropped from .18em to .14em — and to .08em
   * in the 3-across "bay" layout, or "JEDINICE"/"UGOVORI" wrap to two lines.
   */
  eyebrow: {
    base: { size: 11, weight: '600' as const, letterSpacing: 1.54, textTransform: 'uppercase' as const },
    sm: { size: 10, weight: '600' as const, letterSpacing: 0.8, textTransform: 'uppercase' as const },
  },

  /**
   * Currency suffix rendered beside a Fraunces figure ("1.300 EUR").
   * Inter, muted, raised toward the cap line — NOT baseline-aligned.
   * Sizes are relative to the figure: 0.38em, offset 0.62em, margin 0.2em.
   */
  currency: {
    sizeRatio: 0.38,
    baselineShiftRatio: 0.62,
    marginLeftRatio: 0.2,
    weight: '500' as const,
    letterSpacing: 0.02,
  },

  /**
   * Legacy Material-style scale — used by unmigrated StyleSheets
   * (`...Typography.labelSmall`). Prefer `text` / `display` / `eyebrow` for
   * new Naslov work.
   */
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

/* ============================================================================
   RADII / SPACING
   ============================================================================ */

export const Radius = {
  xs: 6,     // checkbox
  sm: 12,
  md: 14,    // text input, selectrow
  lg: 16,    // calendar cell
  xl: 24,    // card, bays, modal
  '2xl': 26, // bottom sheet top corners
  '3xl': 28, // floating tab bar
  full: 999, // EVERY button, pill, chip, avatar, icon well
} as const;

export const Spacing = {
  /** Legacy 4pt scale — still used by unmigrated screens/StyleSheets. */
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  /** Screen body horizontal padding. The horizontal-scroll edge bleed uses
   *  exactly -gutter margin + gutter padding; keep them locked together. */
  gutter: 17,
  /** Reserve at the bottom of every ScrollView so the last row clears the
   *  floating tab bar. */
  scrollBottom: 100,
  /** Same, for screens with a floating CTA instead of tabs. */
  scrollBottomCta: 96,
} as const;

/* ============================================================================
   ELEVATION
   Dark theme has no shadow at all — cards sit on near-black, so a shadow is
   invisible and a border is just noise. Light theme gets a micro-shadow.
   ============================================================================ */

export const Elevation = {
  dark: {
    card: {},
    float: {
      shadowColor: '#000',
      shadowOpacity: 0.28,
      shadowRadius: 24,
      shadowOffset: { width: 0, height: 10 },
      elevation: 8,
    },
    modal: {
      shadowColor: '#000',
      shadowOpacity: 0.4,
      shadowRadius: 56,
      shadowOffset: { width: 0, height: 24 },
      elevation: 16,
    },
    sheet: {
      shadowColor: '#000',
      shadowOpacity: 0.25,
      shadowRadius: 32,
      shadowOffset: { width: 0, height: -12 },
      elevation: 16,
    },
  },
  light: {
    card: {
      shadowColor: 'rgb(28,24,18)',
      shadowOpacity: 0.045,
      shadowRadius: 2,
      shadowOffset: { width: 0, height: 1 },
      elevation: 1,
    },
    float: {
      shadowColor: 'rgb(28,24,18)',
      shadowOpacity: 0.18,
      shadowRadius: 24,
      shadowOffset: { width: 0, height: 10 },
      elevation: 8,
    },
    modal: {
      shadowColor: 'rgb(28,24,18)',
      shadowOpacity: 0.22,
      shadowRadius: 56,
      shadowOffset: { width: 0, height: 24 },
      elevation: 16,
    },
    sheet: {
      shadowColor: 'rgb(28,24,18)',
      shadowOpacity: 0.15,
      shadowRadius: 32,
      shadowOffset: { width: 0, height: -12 },
      elevation: 16,
    },
  },
} as const;

/* ============================================================================
   EXPENSE CATEGORIES
   One place defines colour + icon + label for every category. Analitika's
   breakdown, the Troškovi filter sheet and the Novi trošak form all read
   from here — that's why the same category is the same colour everywhere.
   ============================================================================ */

export type ExpenseCategoryKey =
  | 'komunalija'
  | 'struja'
  | 'popravak'
  | 'internet'
  | 'osiguranje'
  | 'ostalo';

export const EXPENSE_CATEGORIES: Record<
  ExpenseCategoryKey,
  { label: string; chartSlot: 0 | 1 | 2 | 3 | 4 | 5; icon: string }
> = {
  komunalija: { label: 'Komunalija', chartSlot: 0, icon: 'Building2' },
  struja: { label: 'Struja', chartSlot: 4, icon: 'Zap' },
  popravak: { label: 'Popravak', chartSlot: 2, icon: 'Wrench' },
  internet: { label: 'Internet', chartSlot: 1, icon: 'Globe' },
  osiguranje: { label: 'Osiguranje', chartSlot: 5, icon: 'Shield' },
  ostalo: { label: 'Ostalo', chartSlot: 3, icon: 'Tag' },
} as const;

/* ============================================================================
   PAYMENT STATUS
   Only `paid` gets an icon. Every other state is colour/shape only — an icon
   per state was more to decode than a monthly grid needs, and the one glyph
   that matters is the one confirming money arrived.
   ============================================================================ */

export type PaymentStatus = 'paid' | 'pending' | 'late' | 'partial' | 'none';

export const PAYMENT_STATUS: Record<
  PaymentStatus,
  { label: string; tone: 'pos' | 'primary' | 'neg' | 'muted'; icon: string | null; ring?: 'solid' | 'dashed' }
> = {
  paid: { label: 'Plaćeno', tone: 'pos', icon: 'CircleCheck' },
  pending: { label: 'Na čekanju', tone: 'primary', icon: null },
  late: { label: 'Kasno', tone: 'neg', icon: null },
  partial: { label: 'Djelomično', tone: 'muted', icon: null, ring: 'dashed' },
  none: { label: 'Bez zapisa', tone: 'muted', icon: null, ring: 'solid' },
} as const;

/* ============================================================================
   LEGACY Colors — temporary bridge for unmigrated call sites

   Maps the pre-Naslov `Colors.*` API onto Naslov tokens (mostly LIGHT, with
   *Dark surface variants from DARK). Remove keys as screens migrate to
   useAppTheme().colors / className tokens. Not a second design system.
   ============================================================================ */

export const Colors = {
  primary: LIGHT.primary,
  primaryLight: LIGHT.primaryTint,
  accent: LIGHT.pos,
  warning: LIGHT.chart[4],
  danger: LIGHT.neg,

  background: LIGHT.bg,
  surface: LIGHT.surface,
  surfaceVariant: LIGHT.surface2,
  border: LIGHT.bd,

  backgroundDark: DARK.bg,
  surfaceDark: DARK.surface,
  surfaceVariantDark: DARK.surface2,
  borderDark: DARK.bd,

  textPrimary: LIGHT.fg,
  textSecondary: LIGHT.muted,
  textDisabled: LIGHT.muted,
  textInverse: '#FFFFFF',

  statusPaid: LIGHT.pos,
  statusPending: LIGHT.primary,
  statusLate: LIGHT.neg,
  statusPartial: LIGHT.chart[5],

  typeApartment: LIGHT.primary,
  typeHouse: LIGHT.pos,
  typeGarage: LIGHT.muted,
  typeOther: LIGHT.chart[5],
} as const;
