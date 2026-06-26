import { Building2 } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { Colors, Spacing, Typography } from '@/constants/theme';
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
  const theme = useTheme();
  const { t } = useTranslation();

  if (properties.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.heading, { color: theme.colors.onSurface }]}>
          {t('dashboard.recentProperties')}
        </Text>
        {onViewAll ? (
          <Pressable onPress={onViewAll} accessibilityRole="button">
            <Text style={[styles.viewAll, { color: theme.colors.primary }]}>
              {t('dashboard.viewAllProperties')}
            </Text>
          </Pressable>
        ) : null}
      </View>

      {properties.map((property) => {
        const isRented = property.usage_status === 'rented';
        const rightLabel = isRented
          ? formatCurrency(
              Number(property.rent_amount),
              property.currency ?? currency,
              language,
            )
          : t(`usageStatus.${property.usage_status}`);

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
            <View style={[styles.iconWrap, { backgroundColor: `${Colors.primary}22` }]}>
              <Building2 size={18} color={Colors.primary} strokeWidth={2} />
            </View>

            <View style={styles.rowContent}>
              <Text style={[styles.title, { color: theme.colors.onSurface }]} numberOfLines={1}>
                {property.name}
              </Text>
              <Text
                style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
                numberOfLines={1}
              >
                {property.address}
              </Text>
            </View>

            <Text
              style={[
                styles.meta,
                { color: isRented ? theme.colors.primary : theme.colors.onSurfaceVariant },
              ]}
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

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  heading: {
    ...Typography.titleMedium,
  },
  viewAll: {
    ...Typography.labelLarge,
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
  subtitle: {
    ...Typography.bodySmall,
  },
  meta: {
    ...Typography.labelLarge,
    maxWidth: 96,
    textAlign: 'right',
  },
});
