import { format } from 'date-fns';
import { enUS, hr } from 'date-fns/locale';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { HEADER_ACTION_SLOT } from '@/constants/header';
import { useAppTheme } from '@/hooks/useAppTheme';
import { displayFontFamily, Fonts } from '@/lib/fonts';
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
  const { colors } = theme;
  const locale = dateLocales[language];

  const dateLabel = format(new Date(), 'EEEE · dd.MM.yyyy', { locale });
  const greetingLine = getGreetingLine(t);
  const displayName = firstName(name) || t('dashboard.greetingFallbackName');

  return (
    <View style={styles.wrap}>
      <View style={styles.topRow}>
        <Text
          style={{
            fontFamily: Fonts.sans.semibold,
            fontSize: 11,
            lineHeight: 14,
            letterSpacing: 1.54,
            textTransform: 'uppercase',
            color: colors.muted,
            flex: 1,
          }}
          numberOfLines={1}
        >
          {dateLabel}
        </Text>
        {showAdd ? <View style={styles.addClearance} /> : null}
      </View>

      <View style={styles.titleBlk}>
        <Text
          style={{
            fontFamily: displayFontFamily(theme.name),
            fontSize: 32,
            lineHeight: 36,
            letterSpacing: -0.64,
            color: colors.fg,
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

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 0,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    gap: 12,
    minHeight: HEADER_ACTION_SLOT + 32,
  },
  addClearance: {
    width: HEADER_ACTION_SLOT,
    height: HEADER_ACTION_SLOT,
  },
  titleBlk: {
    paddingTop: 0,
    marginBottom: 18,
  },
});
