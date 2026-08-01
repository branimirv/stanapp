import { Archive, MapPin, Trash2 } from 'lucide-react-native';
import { memo, useRef } from 'react';
import { Pressable, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useTranslation } from 'react-i18next';

import { AppBadge } from '@/components/ui/AppBadge';
import { PropertyTypeBadge } from '@/components/property/PropertyTypeBadge';
import { UsageStatusBadge } from '@/components/property/UsageStatusBadge';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { Colors } from '@/constants/theme';
import { formatCurrencyShort } from '@/utils/formatters';
import type { Language, Property } from '@/types/app.types';

export interface PropertyCardProps {
  property: Property;
  tenantName?: string | null;
  overdueCount?: number;
  currency?: string;
  language?: Language;
  onPress?: (propertyId: string) => void;
  onArchive?: (propertyId: string) => void;
  onDelete?: (propertyId: string) => void;
}

function PropertyCardComponent({
  property,
  tenantName,
  overdueCount = 0,
  currency = 'EUR',
  language = 'hr',
  onPress,
  onArchive,
  onDelete,
}: PropertyCardProps) {
  const { t, i18n } = useTranslation();
  const swipeableRef = useRef<Swipeable>(null);
  const resolvedLanguage = language ?? (i18n.language === 'en' ? 'en' : 'hr');
  const isRented = property.usage_status === 'rented';
  const handlePress = onPress ? () => onPress(property.id) : undefined;

  const renderRightActions = () => (
    <View className="mb-2 flex-row">
      {onArchive ? (
        <Pressable
          className="ml-1 w-20 items-center justify-center gap-1 rounded-xl px-2"
          style={{ backgroundColor: Colors.warning }}
          onPress={() => {
            swipeableRef.current?.close();
            onArchive(property.id);
          }}
          accessibilityRole="button"
          accessibilityLabel={t('common.archive')}
        >
          <Archive size={20} color={Colors.textInverse} strokeWidth={2} />
          <Text className="text-center text-[11px] font-medium" style={{ color: Colors.textInverse }}>
            {t('common.archive')}
          </Text>
        </Pressable>
      ) : null}
      {onDelete ? (
        <Pressable
          className="ml-1 w-20 items-center justify-center gap-1 rounded-xl px-2"
          style={{ backgroundColor: Colors.danger }}
          onPress={() => {
            swipeableRef.current?.close();
            onDelete(property.id);
          }}
          accessibilityRole="button"
          accessibilityLabel={t('common.delete')}
        >
          <Trash2 size={20} color={Colors.textInverse} strokeWidth={2} />
          <Text className="text-center text-[11px] font-medium" style={{ color: Colors.textInverse }}>
            {t('common.delete')}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );

  const card = (
    <Pressable onPress={handlePress} disabled={!handlePress}>
      <Card className="mb-2 gap-2 rounded-xl p-4">
        <View className="flex-row items-center justify-between gap-2">
          <PropertyTypeBadge type={property.type} compact />
          <UsageStatusBadge status={property.usage_status} />
        </View>

        <Text className="text-lg font-semibold" numberOfLines={1}>
          {property.name}
        </Text>

        <View className="flex-row items-center gap-1">
          <MapPin size={14} className="text-muted-foreground" strokeWidth={2} />
          <Text className="text-muted-foreground flex-1 text-sm" numberOfLines={1}>
            {property.address}
          </Text>
        </View>

        <View className="mt-1 flex-row items-end justify-between gap-2">
          {isRented ? (
            <View className="flex-1 gap-0.5">
              <Text className="text-muted-foreground text-sm">
                {tenantName ?? t('properties.noTenant')}
              </Text>
              <Text className="text-base font-medium">
                {formatCurrencyShort(
                  Number(property.rent_amount),
                  property.currency ?? currency,
                  resolvedLanguage,
                )}
                <Text className="text-muted-foreground text-xs"> {t('properties.perMonthSuffix')}</Text>
              </Text>
            </View>
          ) : (
            <Text className="text-muted-foreground flex-1 text-sm">
              {t(`usageStatus.${property.usage_status}`)}
            </Text>
          )}

          {overdueCount > 0 ? (
            <AppBadge
              label={t('properties.overdueBadge', { count: overdueCount })}
              variant="error"
            />
          ) : null}
        </View>
      </Card>
    </Pressable>
  );

  if (!onArchive && !onDelete) {
    return card;
  }

  return (
    <Swipeable ref={swipeableRef} renderRightActions={renderRightActions} overshootRight={false}>
      {card}
    </Swipeable>
  );
}

export const PropertyCard = memo(PropertyCardComponent);
