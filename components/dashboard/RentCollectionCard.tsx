import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { DisplayAmount, formatDisplayNumber } from '@/components/ui/DisplayAmount';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Typography } from '@/constants/theme';
import { displayFontFamily } from '@/lib/fonts';
import type { Language } from '@/types/app.types';

export interface RentCollectionCardProps {
  collected: number;
  expected: number;
  currency: string;
  language?: Language;
  /** Paid units / expected units — omit count clause when missing. */
  paidCount?: number;
  expectedCount?: number;
  onPress?: () => void;
}

export function RentCollectionCard({
  collected,
  expected,
  currency,
  language = 'hr',
  paidCount,
  expectedCount,
  onPress,
}: RentCollectionCardProps) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const { elevation } = theme;

  const progress = expected > 0 ? Math.min(collected / expected, 1) : 0;
  const progressPct = Math.round(progress * 100);

  const metaParts = [
    t('dashboard.rentOfExpected', {
      amount: `${formatDisplayNumber(expected, language)} ${currency === 'EUR' ? '€' : currency}`,
    }),
  ];
  if (
    paidCount !== undefined &&
    expectedCount !== undefined &&
    expectedCount > 0
  ) {
    metaParts.push(t('dashboard.rentPaidOfTotal', { paid: paidCount, total: expectedCount }));
  }

  return (
    <View className="mb-3">
      <View className="mb-2.75 flex-row items-baseline justify-between">
        <Text
          className="text-fg text-[22px] leading-6 tracking-[-0.55px]"
          style={{ fontFamily: displayFontFamily(theme.name) }}
        >
          {t('dashboard.rentCollection')}
        </Text>
        <Text
          className="text-primary text-[18px] leading-4.5 tracking-[-0.36px]"
          style={{ fontFamily: displayFontFamily(theme.name) }}
        >
          {progressPct} %
        </Text>
      </View>

      <Pressable
        onPress={onPress}
        disabled={!onPress}
        accessibilityRole={onPress ? 'button' : undefined}
        className="border-card-bd bg-surface rounded-xl border p-4.5"
        style={elevation.card}
      >
        <View className="bg-track h-1.5 overflow-hidden rounded-full">
          <View
            className="bg-primary h-full rounded-full"
            style={{ width: `${progressPct}%` }}
          />
        </View>

        <View className="mt-3.25 flex-row flex-wrap items-baseline gap-2.25">
          <DisplayAmount
            amount={collected}
            currency={currency}
            language={language}
            size={Typography.display.amountSm.size}
            lineHeight={Typography.display.amountSm.lineHeight}
            letterSpacing={Typography.display.amountSm.letterSpacing}
          />
          <Text
            className="text-muted shrink text-[10px] font-semibold uppercase tracking-[0.8px]"
            numberOfLines={1}
          >
            {metaParts.join(' · ')}
          </Text>
        </View>
      </Pressable>
    </View>
  );
}
