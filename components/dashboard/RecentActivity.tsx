import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { EmptyState } from '@/components/ui/EmptyState';
import { Text } from '@/components/ui/text';
import { Colors } from '@/constants/theme';
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
  const { t, i18n } = useTranslation();
  const resolvedLanguage = language ?? (i18n.language === 'en' ? 'en' : 'hr');

  if (items.length === 0) {
    return (
      <EmptyState
        title={t('dashboard.noRecentActivity')}
        subtitle={t('empty.noActivityHint')}
        className="py-6"
      />
    );
  }

  return (
    <View className="gap-2">
      <Text className="mb-1 text-base font-medium">{t('dashboard.recentActivity')}</Text>

      {items.map((item) => {
        const isIncome = item.type === 'rent_payment';
        const accentColor = isIncome ? Colors.accent : Colors.danger;
        const typeLabel = isIncome ? t('dashboard.activityRent') : t('dashboard.activityExpense');
        const detail = getItemDetail(item, t);

        const content = (
          <View className="bg-card border-border mb-1 flex-row items-center gap-2 rounded-md border px-4 py-2.5">
            <View className="flex-1 gap-px">
              <Text className="text-base" numberOfLines={1}>
                <Text style={{ color: accentColor }}>{typeLabel}</Text>
                <Text className="text-muted-foreground"> · </Text>
                <Text>{detail}</Text>
              </Text>
              <Text className="text-muted-foreground text-xs">
                {formatDate(item.created_at, resolvedLanguage)}
              </Text>
            </View>

            <Text className="text-base font-semibold" style={{ color: accentColor }}>
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
