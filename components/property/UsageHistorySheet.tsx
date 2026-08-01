import { Modal, Pressable, ScrollView, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { formatDistanceStrict, parseISO } from 'date-fns';
import { enUS, hr } from 'date-fns/locale';

import { UsageStatusBadge } from '@/components/property/UsageStatusBadge';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
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

export function UsageHistorySheet({
  visible,
  onDismiss,
  propertyId,
  language,
}: UsageHistorySheetProps) {
  const { t } = useTranslation();
  const { history, isLoading, error } = usePropertyStatusHistory(propertyId, visible);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onDismiss}>
      <Pressable className="flex-1 justify-end bg-black/45" onPress={onDismiss}>
        <Pressable
          className="bg-card gap-4 rounded-t-[20px] px-6 pb-8 pt-2"
          style={{ maxHeight: '70%' }}
          onPress={(event) => event.stopPropagation()}
        >
          <View className="bg-border mb-2 h-1 w-9 self-center rounded-full" />

          <Text className="text-center text-base font-medium">
            {t('properties.usageHistory')}
          </Text>

          {isLoading ? (
            <SkeletonLoader count={3} />
          ) : error ? (
            <Text className="text-destructive py-6 text-center text-sm">{error}</Text>
          ) : history.length === 0 ? (
            <Text className="text-muted-foreground py-6 text-center text-sm">
              {t('properties.usageHistoryEmpty')}
            </Text>
          ) : (
            <ScrollView style={{ flexGrow: 0 }} contentContainerClassName="pb-2">
              {history.map((entry, index) => {
                const start = parseISO(entry.started_at);
                const end = entry.ended_at ? parseISO(entry.ended_at) : new Date();
                const duration = formatDistanceStrict(end, start, {
                  locale: dateLocales[language],
                });
                const rangeLabel = entry.ended_at
                  ? `${formatDate(entry.started_at, language)} – ${formatDate(entry.ended_at, language)}`
                  : t('properties.usageSince', { date: formatDate(entry.started_at, language) });

                return (
                  <View
                    key={entry.id}
                    className={cn(
                      'flex-row items-center gap-4 py-4',
                      index < history.length - 1 && 'border-border border-b',
                    )}
                  >
                    <UsageStatusBadge status={entry.status} />
                    <View className="flex-1 gap-0.5">
                      <Text className="text-sm">{rangeLabel}</Text>
                      <Text className="text-muted-foreground text-xs">{duration}</Text>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
