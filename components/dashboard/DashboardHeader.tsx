import { format } from 'date-fns';
import { enUS, hr } from 'date-fns/locale';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { HEADER_ACTION_SLOT } from '@/constants/header';
import { useAppTheme } from '@/hooks/useAppTheme';
import { displayFontFamily } from '@/lib/fonts';
import type { Language } from '@/types/app.types';

const dateLocales = { en: enUS, hr } as const;

export interface DashboardHeaderProps {
  name?: string | null;
  language?: Language;
  /** Reserve trailing space so the floating Plus aligns with the date row. */
  showAdd?: boolean;
}

function getGreetingLine(t: (key: string) => string): string {
  const hour = new Date().getHours();
  if (hour < 12) return t('dashboard.greetingMorningLine');
  if (hour < 18) return t('dashboard.greetingAfternoonLine');
  return t('dashboard.greetingEveningLine');
}

/** Mockup uses first name only (“Branimir”), not full_name. */
function firstName(fullName?: string | null): string | null {
  const trimmed = fullName?.trim();
  if (!trimmed) return null;
  return trimmed.split(/\s+/)[0] ?? null;
}

export function DashboardHeader({
  name,
  language = 'hr',
  showAdd = false,
}: DashboardHeaderProps) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const locale = dateLocales[language];

  const dateLabel = format(new Date(), 'EEEE · dd.MM.yyyy', { locale });
  const greetingLine = getGreetingLine(t);
  const displayName = firstName(name) || t('dashboard.greetingFallbackName');

  return (
    <View>
      <View
        className="flex-row items-center justify-between gap-3 py-4"
        style={{ minHeight: HEADER_ACTION_SLOT + 32 }}
      >
        <Text
          className="text-muted flex-1 text-[11px] leading-3.5 font-semibold tracking-[1.54px] uppercase"
          numberOfLines={1}
        >
          {dateLabel}
        </Text>
        {showAdd ? (
          <View style={{ width: HEADER_ACTION_SLOT, height: HEADER_ACTION_SLOT }} />
        ) : null}
      </View>

      <View className="mb-4.5">
        <Text
          className="text-fg text-[32px] tracking-[-0.64px]"
          style={{
            fontFamily: displayFontFamily(theme.name),
            lineHeight: 36,
          }}
        >
          {greetingLine}
          {'\n'}
          {displayName}
        </Text>
      </View>
    </View>
  );
}
