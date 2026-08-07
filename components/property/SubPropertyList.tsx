import { router } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { EmptyState } from '@/components/ui/EmptyState';
import { PropertyTypeBadge } from '@/components/property/PropertyTypeBadge';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { routes } from '@/lib/routes';
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
  const { t } = useTranslation();
  const items = subProperties ?? properties ?? [];

  const handlePress = (propertyId: string) => {
    if (onPropertyPress) {
      onPropertyPress(propertyId);
      return;
    }
    router.push(routes.property.detail(propertyId));
  };

  if (items.length === 0) {
    return (
      <EmptyState
        title={t('empty.noSubProperties')}
        subtitle={t('empty.noSubPropertiesHint')}
        className="py-6"
      />
    );
  }

  return (
    <View className="gap-2">
      <Text className="mb-1 text-base font-medium">{t('properties.subProperties')}</Text>
      <Text className="text-muted-foreground mb-2 text-xs">
        {t('properties.subPropertiesHint')}
      </Text>

      {items.map((property) => (
        <Pressable key={property.id} onPress={() => handlePress(property.id)}>
          <Card className="border-border mb-2 gap-0 rounded-xl border p-0">
            <View className="flex-row items-center justify-between gap-2 px-4 py-2">
              <View className="flex-1 flex-row items-center gap-2">
                <PropertyTypeBadge type={property.type} compact />
                <View className="flex-1 gap-0.5">
                  <Text className="text-base font-medium" numberOfLines={1}>
                    {property.name}
                  </Text>
                  <Text className="text-muted-foreground text-xs" numberOfLines={1}>
                    {property.address}
                  </Text>
                </View>
              </View>
              <ChevronRight size={20} className="text-muted-foreground" strokeWidth={2} />
            </View>
          </Card>
        </Pressable>
      ))}
    </View>
  );
}
