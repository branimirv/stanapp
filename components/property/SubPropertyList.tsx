import { router } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '@/components/ui/EmptyState';
import { PropertyTypeBadge } from '@/components/property/PropertyTypeBadge';
import { Colors, Spacing, Typography } from '@/constants/theme';
import type { Property } from '@/types/app.types';

export interface SubPropertyListProps {
  subProperties?: Property[];
  properties?: Property[];
  onPropertyPress?: (propertyId: string) => void;
}

export function SubPropertyList({
  subProperties,
  properties,
  onPropertyPress,
}: SubPropertyListProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const items = subProperties ?? properties ?? [];

  const handlePress = (propertyId: string) => {
    if (onPropertyPress) {
      onPropertyPress(propertyId);
      return;
    }
    router.push({ pathname: '/property/[id]', params: { id: propertyId } });
  };

  if (items.length === 0) {
    return (
      <EmptyState
        title={t('empty.noSubProperties')}
        subtitle={t('empty.noSubPropertiesHint')}
        style={styles.empty}
      />
    );
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.heading, { color: theme.colors.onSurface }]}>
        {t('properties.subProperties')}
      </Text>
      <Text style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
        {t('properties.subPropertiesHint')}
      </Text>

      {items.map((property) => (
        <Pressable key={property.id} onPress={() => handlePress(property.id)}>
          <Card
            mode="outlined"
            style={[
              styles.card,
              {
                backgroundColor: theme.dark ? Colors.surfaceDark : Colors.surface,
                borderColor: theme.colors.outline,
              },
            ]}
          >
            <Card.Content style={styles.cardContent}>
              <View style={styles.cardMain}>
                <PropertyTypeBadge type={property.type} compact />
                <View style={styles.cardText}>
                  <Text
                    style={[styles.name, { color: theme.colors.onSurface }]}
                    numberOfLines={1}
                  >
                    {property.name}
                  </Text>
                  <Text
                    style={[styles.address, { color: theme.colors.onSurfaceVariant }]}
                    numberOfLines={1}
                  >
                    {property.address}
                  </Text>
                </View>
              </View>
              <ChevronRight size={20} color={theme.colors.onSurfaceVariant} strokeWidth={2} />
            </Card.Content>
          </Card>
        </Pressable>
      ))}
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
  hint: {
    ...Typography.bodySmall,
    marginBottom: Spacing.sm,
  },
  empty: {
    paddingVertical: Spacing.lg,
  },
  card: {
    borderRadius: 12,
    marginBottom: Spacing.sm,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  cardMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  cardText: {
    flex: 1,
    gap: 2,
  },
  name: {
    ...Typography.titleMedium,
  },
  address: {
    ...Typography.bodySmall,
  },
});
