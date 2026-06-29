import { Pressable, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '@/components/ui/EmptyState';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { formatCurrency, formatDate } from '@/utils/formatters';
import type { Language, RecentActivityItem } from '@/types/app.types';

export interface RecentActivityProps {
  items: RecentActivityItem[];
  language?: Language;
  onItemPress?: (item: RecentActivityItem) => void;
}

function getItemDetail(item: RecentActivityItem, t: (key: string, options?: { defaultValue?: string }) => string) {
  if (item.type === 'expense') {
    return t(`categories.${item.title}`, { defaultValue: item.title });
  }
  return item.title;
}

export function RecentActivity({ items, language = 'hr', onItemPress }: RecentActivityProps) {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const resolvedLanguage = language ?? (i18n.language === 'en' ? 'en' : 'hr');

  if (items.length === 0) {
    return (
      <EmptyState
        title={t('dashboard.noRecentActivity')}
        subtitle={t('empty.noActivityHint')}
        style={styles.empty}
      />
    );
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.heading, { color: theme.colors.onSurface }]}>
        {t('dashboard.recentActivity')}
      </Text>

      {items.map((item) => {
        const isIncome = item.type === 'rent_payment';
        const accentColor = isIncome ? Colors.accent : Colors.danger;
        const typeLabel = isIncome ? t('dashboard.activityRent') : t('dashboard.activityExpense');
        const detail = getItemDetail(item, t);

        const content = (
          <View
            style={[
              styles.row,
              {
                backgroundColor: theme.dark ? Colors.surfaceDark : Colors.surface,
                borderColor: theme.colors.outline,
              },
            ]}
          >
            <View style={styles.rowContent}>
              <Text style={styles.titleLine} numberOfLines={1}>
                <Text style={{ color: accentColor }}>{typeLabel}</Text>
                <Text style={{ color: theme.colors.onSurfaceVariant }}> · </Text>
                <Text style={{ color: theme.colors.onSurface }}>{detail}</Text>
              </Text>
              <Text style={[styles.date, { color: theme.colors.onSurfaceVariant }]}>
                {formatDate(item.created_at, resolvedLanguage)}
              </Text>
            </View>

            <Text style={[styles.amount, { color: accentColor }]}>
              {isIncome ? '+' : '-'}
              {formatCurrency(item.amount, item.currency ?? 'EUR', resolvedLanguage)}
            </Text>
          </View>
        );

        if (onItemPress) {
          return (
            <Pressable key={`${item.type}-${item.id}`} onPress={() => onItemPress(item)}>
              {content}
            </Pressable>
          );
        }

        return <View key={`${item.type}-${item.id}`}>{content}</View>;
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  heading: {
    ...Typography.titleMedium,
    marginBottom: Spacing.xs,
  },
  empty: {
    paddingVertical: Spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    marginBottom: Spacing.xs,
  },
  rowContent: {
    flex: 1,
    gap: 1,
  },
  titleLine: {
    ...Typography.bodyLarge,
  },
  date: {
    ...Typography.bodySmall,
  },
  amount: {
    ...Typography.bodyLarge,
    fontWeight: '600',
  },
});
