import { Text, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { Typography } from '@/constants/theme';
import { displayFontFamily, Fonts } from '@/lib/fonts';
import type { Language } from '@/types/app.types';

function getIntlLocale(language: Language): string {
  return language === 'en' ? 'en-GB' : 'hr-HR';
}

/** Format a bare amount (no currency symbol) for Fraunces display. */
export function formatDisplayNumber(amount: number, language: Language = 'hr'): string {
  // Mockup uses whole euros for dashboard figures (1.300).
  return new Intl.NumberFormat(getIntlLocale(language), {
    minimumFractionDigits: 0,
    maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
  }).format(amount);
}

export interface DisplayAmountProps {
  amount: number;
  currency?: string;
  language?: Language;
  /** Fraunces figure size (default hero 46). */
  size?: number;
  lineHeight?: number;
  letterSpacing?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
  amountStyle?: StyleProp<TextStyle>;
}

/**
 * Naslov money figure — Fraunces amount + raised Inter currency suffix.
 * Ratios from Typography.currency (0.38em / 0.62em / 0.2em).
 */
export function DisplayAmount({
  amount,
  currency = 'EUR',
  language = 'hr',
  size = Typography.display.hero.size,
  lineHeight,
  letterSpacing,
  color,
  style,
  amountStyle,
}: DisplayAmountProps) {
  const { theme } = useAppTheme();
  const { colors } = theme;
  const figureColor = color ?? colors.fg;
  const lh = lineHeight ?? size;
  const ls =
    letterSpacing ??
    (size >= 40
      ? Typography.display.hero.letterSpacing
      : size >= 28
        ? Typography.display.amountLg.letterSpacing
        : Typography.display.amountSm.letterSpacing);
  const curSize = size * Typography.currency.sizeRatio;
  const curShift = size * Typography.currency.baselineShiftRatio;

  return (
    <View style={[{ flexDirection: 'row', alignItems: 'flex-start' }, style]}>
      <Text
        style={[
          {
            fontFamily: displayFontFamily(theme.name),
            fontSize: size,
            lineHeight: lh,
            letterSpacing: ls,
            color: figureColor,
            fontVariant: ['tabular-nums', 'lining-nums'],
          },
          amountStyle,
        ]}
      >
        {formatDisplayNumber(amount, language)}
      </Text>
      <Text
        style={{
          fontFamily: Fonts.sans.medium,
          fontSize: curSize,
          lineHeight: curSize * 1.2,
          color: colors.muted,
          letterSpacing: Typography.currency.letterSpacing,
          marginLeft: size * Typography.currency.marginLeftRatio,
          transform: [{ translateY: curShift * 0.35 }],
        }}
      >
        {currency}
      </Text>
    </View>
  );
}
