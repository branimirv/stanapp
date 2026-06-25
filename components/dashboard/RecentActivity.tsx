import { ArrowDownLeft, ArrowUpRight } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '@/components/ui/EmptyState';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { formatCurrency, formatDateTime } from '@/utils/formatters';
import type { Language, RecentActivityItem } from '@/types/app.types';

export interface RecentActivityProps {
  items: RecentActivityItem[];
  language?: Language;
  onItemPress?: (item: RecentActivityItem) => void;
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
        const Icon = isIncome ? ArrowDownLeft : ArrowUpRight;
        const accentColor = isIncome ? Colors.accent : Colors.danger;
        const prefix = isIncome ? '+' : '-';

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
            <View style={[styles.iconWrap, { backgroundColor: `${accentColor}22` }]}>
              <Icon size={18} color={accentColor} strokeWidth={2} />
            </View>

            <View style={styles.rowContent}>
              <Text style={[styles.title, { color: theme.colors.onSurface }]} numberOfLines={1}>
                {item.type === 'expense'
                  ? t(`categories.${item.title}`, { defaultValue: item.title })
                  : item.title}
              </Text>
              <Text style={[styles.date, { color: theme.colors.onSurfaceVariant }]}>
                {formatDateTime(item.created_at, resolvedLanguage)}
              </Text>
            </View>

            <Text style={[styles.amount, { color: accentColor }]}>
              {prefix}
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
    borderRadius: 12,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowContent: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...Typography.bodyLarge,
  },
  date: {
    ...Typography.bodySmall,
  },
  amount: {
    ...Typography.titleMedium,
  },
});
