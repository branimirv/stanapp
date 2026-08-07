import { Archive, Building2, House, MapPin, Trash2, Warehouse } from 'lucide-react-native';
import { memo, useRef, type ComponentType } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useTranslation } from 'react-i18next';

import { DisplayAmount } from '@/components/ui/DisplayAmount';
import { useAppTheme } from '@/hooks/useAppTheme';
import { displayFontFamily } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import type { Language, Property, PropertyType } from '@/types/app.types';

const TYPE_ICONS: Record<PropertyType, ComponentType<{ size?: number; color?: string; strokeWidth?: number }>> = {
  apartment: Building2,
  house: House,
  garage: Warehouse,
  other: Building2,
};

export interface PropertyCardProps {
  property: Property;
  tenantName?: string | null;
  currency?: string;
  language?: Language;
  onPress?: (propertyId: string) => void;
  onArchive?: (propertyId: string) => void;
  onDelete?: (propertyId: string) => void;
}

function PropertyCardComponent({
  property,
  tenantName,
  currency = 'EUR',
  language = 'hr',
  onPress,
  onArchive,
  onDelete,
}: PropertyCardProps) {
  const { t, i18n } = useTranslation();
  const { theme } = useAppTheme();
  const { colors, elevation } = theme;
  const swipeableRef = useRef<Swipeable>(null);
  const resolvedLanguage = language ?? (i18n.language === 'en' ? 'en' : 'hr');
  const isRented = property.usage_status === 'rented';
  const isVacant = property.usage_status === 'vacant';
  const handlePress = onPress ? () => onPress(property.id) : undefined;
  const TypeIcon = TYPE_ICONS[property.type] ?? Building2;
  const rentCurrency = property.currency ?? currency;
  const rentMuted = !isRented;
  const warnColor = colors.chart[4];

  const footLabel = isRented
    ? (tenantName ?? t('properties.noTenant'))
    : isVacant
      ? t('properties.noTenantVacant')
      : t(`usageStatus.${property.usage_status}`);

  const renderRightActions = () => (
    <View className="mb-3 flex-row">
      {onArchive ? (
        <Pressable
          className="ml-1 w-20 items-center justify-center gap-1 rounded-sm px-2"
          style={{ backgroundColor: warnColor }}
          onPress={() => {
            swipeableRef.current?.close();
            onArchive(property.id);
          }}
          accessibilityRole="button"
          accessibilityLabel={t('common.archive')}
        >
          <Archive size={20} color="#FFFFFF" strokeWidth={2} />
          <Text className="text-center text-[11px] font-medium text-white">{t('common.archive')}</Text>
        </Pressable>
      ) : null}
      {onDelete ? (
        <Pressable
          className="ml-1 w-20 items-center justify-center gap-1 rounded-sm px-2"
          style={{ backgroundColor: colors.neg }}
          onPress={() => {
            swipeableRef.current?.close();
            onDelete(property.id);
          }}
          accessibilityRole="button"
          accessibilityLabel={t('common.delete')}
        >
          <Trash2 size={20} color="#FFFFFF" strokeWidth={2} />
          <Text className="text-center text-[11px] font-medium text-white">{t('common.delete')}</Text>
        </Pressable>
      ) : null}
    </View>
  );

  const card = (
    <Pressable onPress={handlePress} disabled={!handlePress}>
      <View
        className="border-card-bd bg-surface mb-3 rounded-xl border p-4.5"
        style={elevation.card}
      >
        <View className="mb-3.5 flex-row items-center justify-between">
          <View
            className={cn(
              'h-9.5 w-9.5 items-center justify-center rounded-full',
              isRented ? 'bg-primary-tint' : 'bg-surface-2'
            )}
          >
            <TypeIcon
              size={18}
              color={isRented ? colors.primary : colors.muted}
              strokeWidth={2}
            />
          </View>
          <View
            className={cn(
              'rounded-full px-2.75 py-1.25',
              isRented ? 'bg-pos-tint' : 'bg-surface-2'
            )}
          >
            <Text
              className={cn(
                'text-[11px] font-semibold tracking-[-0.055px]',
                isRented ? 'text-pos' : 'text-muted'
              )}
            >
              {t(`usageStatus.${property.usage_status}`)}
            </Text>
          </View>
        </View>

        <Text
          className="text-fg text-2xl tracking-[-0.6px]"
          style={{
            fontFamily: displayFontFamily(theme.name),
            lineHeight: 26.4,
          }}
          numberOfLines={1}
        >
          {property.name}
        </Text>

        <View className="mt-2 flex-row items-center gap-1.5">
          <MapPin size={13} color={colors.muted} strokeWidth={2} />
          <Text className="text-muted flex-1 text-[12.5px]" numberOfLines={1}>
            {property.address}
          </Text>
        </View>

        <View className="bg-bd mt-3.5 h-px" />

        <View className="mt-3 flex-row items-baseline justify-between">
          <Text
            className="text-muted mr-2 flex-1 text-[10px] font-semibold uppercase tracking-[0.8px]"
            numberOfLines={1}
          >
            {footLabel}
          </Text>
          <View className="shrink-0 flex-row items-baseline">
            <DisplayAmount
              amount={Number(property.rent_amount)}
              currency={rentCurrency}
              language={resolvedLanguage}
              size={22}
              color={rentMuted ? colors.muted : colors.fg}
            />
            <Text className="text-muted ml-0.75 text-[12.5px] font-medium">
              {t('properties.perMonthSuffix')}
            </Text>
          </View>
        </View>
      </View>
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
