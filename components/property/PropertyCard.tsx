import { Archive, MapPin, Trash2 } from 'lucide-react-native';
import { useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Card, Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { AppBadge } from '@/components/ui/AppBadge';
import { PropertyTypeBadge } from '@/components/property/PropertyTypeBadge';
import { UsageStatusBadge } from '@/components/property/UsageStatusBadge';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { formatCurrency } from '@/utils/formatters';
import type { Language, Property } from '@/types/app.types';

export interface PropertyCardProps {
  property: Property;
  tenantName?: string | null;
  overdueCount?: number;
  currency?: string;
  language?: Language;
  onPress?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
}

export function PropertyCard({
  property,
  tenantName,
  overdueCount = 0,
  currency = 'EUR',
  language = 'hr',
  onPress,
  onArchive,
  onDelete,
}: PropertyCardProps) {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const swipeableRef = useRef<Swipeable>(null);
  const resolvedLanguage = language ?? (i18n.language === 'en' ? 'en' : 'hr');
  const isRented = property.usage_status === 'rented';

  const renderRightActions = () => (
    <View style={styles.actions}>
      {onArchive ? (
        <Pressable
          style={[styles.action, styles.archiveAction]}
          onPress={() => {
            swipeableRef.current?.close();
            onArchive();
          }}
          accessibilityRole="button"
          accessibilityLabel={t('common.archive')}
        >
          <Archive size={20} color={Colors.textInverse} strokeWidth={2} />
          <Text style={styles.actionLabel}>{t('common.archive')}</Text>
        </Pressable>
      ) : null}
      {onDelete ? (
        <Pressable
          style={[styles.action, styles.deleteAction]}
          onPress={() => {
            swipeableRef.current?.close();
            onDelete();
          }}
          accessibilityRole="button"
          accessibilityLabel={t('common.delete')}
        >
          <Trash2 size={20} color={Colors.textInverse} strokeWidth={2} />
          <Text style={styles.actionLabel}>{t('common.delete')}</Text>
        </Pressable>
      ) : null}
    </View>
  );

  const card = (
    <Pressable onPress={onPress} disabled={!onPress}>
      <Card
        mode="elevated"
        style={[
          styles.card,
          { backgroundColor: theme.dark ? Colors.surfaceDark : Colors.surface },
        ]}
      >
        <Card.Content style={styles.content}>
          <View style={styles.header}>
            <PropertyTypeBadge type={property.type} compact />
            <UsageStatusBadge status={property.usage_status} />
          </View>

          <Text style={[styles.name, { color: theme.colors.onSurface }]} numberOfLines={1}>
            {property.name}
          </Text>

          <View style={styles.addressRow}>
            <MapPin size={14} color={theme.colors.onSurfaceVariant} strokeWidth={2} />
            <Text
              style={[styles.address, { color: theme.colors.onSurfaceVariant }]}
              numberOfLines={1}
            >
              {property.address}
            </Text>
          </View>

          <View style={styles.footer}>
            {isRented ? (
              <View style={styles.tenantBlock}>
                <Text style={[styles.metaLabel, { color: theme.colors.onSurfaceVariant }]}>
                  {tenantName ?? t('properties.noTenant')}
                </Text>
                <Text style={[styles.rent, { color: theme.colors.primary }]}>
                  {formatCurrency(
                    Number(property.rent_amount),
                    property.currency ?? currency,
                    resolvedLanguage,
                  )}
                  <Text style={[styles.rentSuffix, { color: theme.colors.onSurfaceVariant }]}>
                    {' '}
                    / {t('properties.monthlyRent').toLowerCase()}
                  </Text>
                </Text>
              </View>
            ) : (
              <Text style={[styles.statusLabel, { color: theme.colors.onSurfaceVariant }]}>
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
        </Card.Content>
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

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    marginBottom: Spacing.sm,
  },
  content: {
    gap: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  name: {
    ...Typography.titleLarge,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  address: {
    ...Typography.bodyMedium,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  tenantBlock: {
    flex: 1,
    gap: 2,
  },
  metaLabel: {
    ...Typography.bodyMedium,
  },
  rent: {
    ...Typography.titleMedium,
  },
  rentSuffix: {
    ...Typography.bodySmall,
  },
  statusLabel: {
    ...Typography.bodyMedium,
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
  },
  action: {
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    borderRadius: 12,
    marginLeft: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  archiveAction: {
    backgroundColor: Colors.warning,
  },
  deleteAction: {
    backgroundColor: Colors.danger,
  },
  actionLabel: {
    ...Typography.labelSmall,
    color: Colors.textInverse,
    textAlign: 'center',
  },
});
