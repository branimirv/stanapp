import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Text } from '@/components/ui/text';
import {
  PROPERTY_TYPE_COLORS,
  PROPERTY_TYPE_ICONS,
} from '@/constants/propertyType';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/utils/formatters';
import type { Language, Property } from '@/types/app.types';

export interface RecentPropertiesProps {
  properties: Property[];
  currency?: string;
  language?: Language;
  onPropertyPress?: (property: Property) => void;
  onViewAll?: () => void;
}

export function RecentProperties({
  properties,
  currency = 'EUR',
  language = 'hr',
  onPropertyPress,
  onViewAll,
}: RecentPropertiesProps) {
  const { t } = useTranslation();

  if (properties.length === 0) {
    return null;
  }

  return (
    <View className="mt-6 gap-2">
      <View className="mb-1 flex-row items-center justify-between">
        <Text className="text-base font-medium">{t('dashboard.recentProperties')}</Text>
        {onViewAll ? (
          <Pressable onPress={onViewAll} accessibilityRole="button">
            <Text className="text-primary text-sm font-medium">
              {t('dashboard.viewAllProperties')}
            </Text>
          </Pressable>
        ) : null}
      </View>

      {properties.map((property) => {
        const Icon = PROPERTY_TYPE_ICONS[property.type] ?? PROPERTY_TYPE_ICONS.other;
        const iconColor = PROPERTY_TYPE_COLORS[property.type] ?? PROPERTY_TYPE_COLORS.other;
        const isRented = property.usage_status === 'rented';
        const rightLabel = isRented
          ? formatCurrency(
              Number(property.rent_amount),
              property.currency ?? currency,
              language,
            )
          : t(`usageStatus.${property.usage_status}`);

        const content = (
          <View className="bg-card border-border mb-2 flex-row items-center gap-2 rounded-xl border p-4">
            <View
              className="h-9 w-9 items-center justify-center rounded-full"
              style={{ backgroundColor: `${iconColor}22` }}
            >
              <Icon size={18} color={iconColor} strokeWidth={2} />
            </View>

            <View className="flex-1 gap-0.5">
              <Text className="text-base" numberOfLines={1}>
                {property.name}
              </Text>
              <Text className="text-muted-foreground text-xs" numberOfLines={1}>
                {property.address}
              </Text>
            </View>

            <Text
              className={cn('max-w-24 text-right text-sm font-medium', isRented ? 'text-primary' : 'text-muted-foreground')}
              numberOfLines={1}
            >
              {rightLabel}
            </Text>
          </View>
        );

        if (onPropertyPress) {
          return (
            <Pressable key={property.id} onPress={() => onPropertyPress(property)}>
              {content}
            </Pressable>
          );
        }

        return <View key={property.id}>{content}</View>;
      })}
    </View>
  );
}
