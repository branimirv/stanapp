import { Archive, Building2, House, MapPin, Trash2, Warehouse } from 'lucide-react-native';
import { memo, useRef, type ComponentType } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useTranslation } from 'react-i18next';

import { DisplayAmount } from '@/components/ui/DisplayAmount';
import { Colors } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { displayFontFamily, Fonts } from '@/lib/fonts';
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

  const footLabel = isRented
    ? (tenantName ?? t('properties.noTenant'))
    : isVacant
      ? t('properties.noTenantVacant')
      : t(`usageStatus.${property.usage_status}`);

  const renderRightActions = () => (
    <View style={styles.swipeRow}>
      {onArchive ? (
        <Pressable
          style={[styles.swipeAction, { backgroundColor: Colors.warning }]}
          onPress={() => {
            swipeableRef.current?.close();
            onArchive(property.id);
          }}
          accessibilityRole="button"
          accessibilityLabel={t('common.archive')}
        >
          <Archive size={20} color={Colors.textInverse} strokeWidth={2} />
          <Text style={styles.swipeLabel}>{t('common.archive')}</Text>
        </Pressable>
      ) : null}
      {onDelete ? (
        <Pressable
          style={[styles.swipeAction, { backgroundColor: Colors.danger }]}
          onPress={() => {
            swipeableRef.current?.close();
            onDelete(property.id);
          }}
          accessibilityRole="button"
          accessibilityLabel={t('common.delete')}
        >
          <Trash2 size={20} color={Colors.textInverse} strokeWidth={2} />
          <Text style={styles.swipeLabel}>{t('common.delete')}</Text>
        </Pressable>
      ) : null}
    </View>
  );

  const card = (
    <Pressable onPress={handlePress} disabled={!handlePress}>
      <View
        style={[
          styles.pcard,
          {
            backgroundColor: colors.surface,
            borderColor: colors.cardBd,
            ...elevation.card,
          },
        ]}
      >
        <View style={styles.ptop}>
          <View
            style={[
              styles.iconWell,
              {
                backgroundColor: isRented ? colors.primaryTint : colors.surface2,
              },
            ]}
          >
            <TypeIcon
              size={18}
              color={isRented ? colors.primary : colors.muted}
              strokeWidth={2}
            />
          </View>
          <View
            style={[
              styles.chip,
              {
                backgroundColor: isRented ? colors.posTint : colors.surface2,
              },
            ]}
          >
            <Text
              style={{
                fontFamily: Fonts.sans.semibold,
                fontSize: 11,
                letterSpacing: -0.055,
                color: isRented ? colors.pos : colors.muted,
              }}
            >
              {t(`usageStatus.${property.usage_status}`)}
            </Text>
          </View>
        </View>

        <Text
          style={{
            fontFamily: displayFontFamily(theme.name),
            fontSize: 24,
            lineHeight: 26.4,
            letterSpacing: -0.6,
            color: colors.fg,
          }}
          numberOfLines={1}
        >
          {property.name}
        </Text>

        <View style={styles.paddr}>
          <MapPin size={13} color={colors.muted} strokeWidth={2} />
          <Text
            style={{
              flex: 1,
              fontFamily: Fonts.sans.regular,
              fontSize: 12.5,
              color: colors.muted,
            }}
            numberOfLines={1}
          >
            {property.address}
          </Text>
        </View>

        <View style={[styles.hair, { backgroundColor: colors.bd }]} />

        <View style={styles.pfoot}>
          <Text
            style={{
              fontFamily: Fonts.sans.semibold,
              fontSize: 10,
              letterSpacing: 0.8,
              textTransform: 'uppercase',
              color: colors.muted,
              flex: 1,
              marginRight: 8,
            }}
            numberOfLines={1}
          >
            {footLabel}
          </Text>
          <View style={styles.rentRow}>
            <DisplayAmount
              amount={Number(property.rent_amount)}
              currency={rentCurrency}
              language={resolvedLanguage}
              size={22}
              color={rentMuted ? colors.muted : colors.fg}
            />
            <Text
              style={{
                fontFamily: Fonts.sans.medium,
                fontSize: 12.5,
                color: colors.muted,
                marginLeft: 3,
              }}
            >
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

const styles = StyleSheet.create({
  pcard: {
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    marginBottom: 12,
  },
  ptop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  iconWell: {
    width: 38,
    height: 38,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chip: {
    paddingVertical: 5,
    paddingHorizontal: 11,
    borderRadius: 999,
  },
  paddr: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  hair: {
    height: 1,
    marginTop: 14,
  },
  pfoot: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  rentRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexShrink: 0,
  },
  swipeRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  swipeAction: {
    width: 80,
    marginLeft: 4,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 8,
  },
  swipeLabel: {
    fontFamily: Fonts.sans.medium,
    fontSize: 11,
    color: Colors.textInverse,
    textAlign: 'center',
  },
});
