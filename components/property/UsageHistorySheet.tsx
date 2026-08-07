import { formatDistanceStrict, parseISO } from 'date-fns';
import { enUS, hr } from 'date-fns/locale';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { UsageStatusBadge } from '@/components/property/UsageStatusBadge';
import { AppBottomSheet } from '@/components/ui/AppBottomSheet';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { usePropertyStatusHistory } from '@/hooks/usePropertyStatusHistory';
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
        <Text className="text-neg py-7 text-center text-sm">{error}</Text>
      ) : history.length === 0 ? (
        <View className="bg-surface-2 items-center rounded-lg px-4.5 py-7">
          <Text className="text-muted text-center text-[13px] leading-5">
            {t('properties.usageHistoryEmpty')}
          </Text>
        </View>
      ) : (
        <View className="gap-2.5 pb-1">
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
                className="bg-surface-2 flex-row items-center gap-3.5 rounded-lg px-3.5 py-3.5"
              >
                <UsageStatusBadge status={entry.status} />
                <View className="min-w-0 flex-1">
                  <Text className="text-fg text-sm font-semibold tracking-[-0.14px]">
                    {rangeLabel}
                  </Text>
                  <Text className="text-muted mt-0.5 text-xs">{duration}</Text>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </AppBottomSheet>
  );
}
