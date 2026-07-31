import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { formatDistanceStrict, parseISO } from 'date-fns';
import { enUS, hr } from 'date-fns/locale';
import { UsageStatusBadge } from '@/components/property/UsageStatusBadge';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { Spacing, Typography } from '@/constants/theme';
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
  const theme = useTheme();
  const { t } = useTranslation();
  const { history, isLoading, error } = usePropertyStatusHistory(propertyId, visible);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onDismiss}>
      <Pressable style={styles.overlay} onPress={onDismiss}>
        <Pressable
          style={[styles.content, { backgroundColor: theme.colors.surface }]}
          onPress={(event) => event.stopPropagation()}
        >
          <View style={[styles.handle, { backgroundColor: theme.colors.outlineVariant }]} />

          <Text style={[styles.title, { color: theme.colors.onSurface }]}>
            {t('properties.usageHistory')}
          </Text>

          {isLoading ? (
            <SkeletonLoader count={3} />
          ) : error ? (
            <Text style={[styles.emptyText, { color: theme.colors.error }]}>{error}</Text>
          ) : history.length === 0 ? (
            <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
              {t('properties.usageHistoryEmpty')}
            </Text>
          ) : (
            <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
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
                    style={[
                      styles.entryRow,
                      index < history.length - 1 && {
                        borderBottomWidth: StyleSheet.hairlineWidth,
                        borderBottomColor: theme.colors.outlineVariant,
                      },
                    ]}
                  >
                    <UsageStatusBadge status={entry.status} />
                    <View style={styles.entryInfo}>
                      <Text style={[styles.entryRange, { color: theme.colors.onSurface }]}>
                        {rangeLabel}
                      </Text>
                      <Text style={[styles.entryDuration, { color: theme.colors.onSurfaceVariant }]}>
                        {duration}
                      </Text>
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

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  content: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    gap: Spacing.md,
    maxHeight: '70%',
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    marginBottom: Spacing.sm,
  },
  title: {
    ...Typography.titleMedium,
    textAlign: 'center',
  },
  emptyText: {
    ...Typography.bodyMedium,
    textAlign: 'center',
    paddingVertical: Spacing.lg,
  },
  list: {
    flexGrow: 0,
  },
  listContent: {
    paddingBottom: Spacing.sm,
  },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
  },
  entryInfo: {
    flex: 1,
    gap: 2,
  },
  entryRange: {
    ...Typography.bodyMedium,
  },
  entryDuration: {
    ...Typography.bodySmall,
  },
});
