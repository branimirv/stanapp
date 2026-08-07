import { formatDistanceStrict, parseISO } from 'date-fns';
import { enUS, hr } from 'date-fns/locale';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { UsageStatusBadge } from '@/components/property/UsageStatusBadge';
import { AppBottomSheet } from '@/components/ui/AppBottomSheet';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { useAppTheme } from '@/hooks/useAppTheme';
import { usePropertyStatusHistory } from '@/hooks/usePropertyStatusHistory';
import { Fonts } from '@/lib/fonts';
import type { Language } from '@/types/app.types';
import { formatDate } from '@/utils/formatters';

const dateLocales = { en: enUS, hr } as const;

export interface UsageHistorySheetProps {
  visible: boolean;
  onDismiss: () => void;
  propertyId: string;
  language: Language;
}

/**
 * Usage status timeline — AppBottomSheet + sibling BlurOverlay on the host screen.
 */
export function UsageHistorySheet({
  visible,
  onDismiss,
  propertyId,
  language,
}: UsageHistorySheetProps) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const { colors, radius } = theme;
  const { history, isLoading, error } = usePropertyStatusHistory(propertyId, visible);

  return (
    <AppBottomSheet
      visible={visible}
      onDismiss={onDismiss}
      title={t('properties.usageHistory')}
      scrollable
    >
      {isLoading ? (
        <SkeletonLoader count={3} />
      ) : error ? (
        <Text
          style={{
            fontFamily: Fonts.sans.regular,
            fontSize: 14,
            color: colors.neg,
            textAlign: 'center',
            paddingVertical: 28,
          }}
        >
          {error}
        </Text>
      ) : history.length === 0 ? (
        <View
          style={[
            styles.empty,
            {
              backgroundColor: colors.surface2,
              borderRadius: radius.lg,
            },
          ]}
        >
          <Text
            style={{
              fontFamily: Fonts.sans.regular,
              fontSize: 13,
              lineHeight: 20,
              color: colors.muted,
              textAlign: 'center',
            }}
          >
            {t('properties.usageHistoryEmpty')}
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {history.map((entry) => {
            const start = parseISO(entry.started_at);
            const end = entry.ended_at ? parseISO(entry.ended_at) : new Date();
            const duration = formatDistanceStrict(end, start, {
              locale: dateLocales[language],
            });
            const rangeLabel = entry.ended_at
              ? `${formatDate(entry.started_at, language)} – ${formatDate(entry.ended_at, language)}`
              : t('properties.usageSince', {
                  date: formatDate(entry.started_at, language),
                });

            return (
              <View
                key={entry.id}
                style={[
                  styles.row,
                  {
                    backgroundColor: colors.surface2,
                    borderRadius: radius.lg,
                  },
                ]}
              >
                <UsageStatusBadge status={entry.status} />
                <View style={styles.meta}>
                  <Text
                    style={{
                      fontFamily: Fonts.sans.semibold,
                      fontSize: 14,
                      letterSpacing: -0.14,
                      color: colors.fg,
                    }}
                  >
                    {rangeLabel}
                  </Text>
                  <Text
                    style={{
                      fontFamily: Fonts.sans.regular,
                      fontSize: 12,
                      color: colors.muted,
                      marginTop: 2,
                    }}
                  >
                    {duration}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </AppBottomSheet>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 10,
    paddingBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  meta: {
    flex: 1,
    minWidth: 0,
  },
  empty: {
    paddingVertical: 28,
    paddingHorizontal: 18,
    alignItems: 'center',
  },
});
