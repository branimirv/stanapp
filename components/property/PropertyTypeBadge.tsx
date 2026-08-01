import { View, type StyleProp, type ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Text } from '@/components/ui/text';
import { PROPERTY_TYPE_COLORS, PROPERTY_TYPE_ICONS } from '@/constants/propertyType';
import { cn } from '@/lib/utils';
import type { PropertyType } from '@/types/app.types';

export interface PropertyTypeBadgeProps {
  type: PropertyType;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

export function PropertyTypeBadge({ type, compact = false, style, className }: PropertyTypeBadgeProps) {
  const { t } = useTranslation();
  const Icon = PROPERTY_TYPE_ICONS[type];
  const color = PROPERTY_TYPE_COLORS[type];

  return (
    <View
      className={cn(
        'max-w-full flex-row items-center gap-1 self-start rounded-full px-2.5 py-1',
        compact && 'px-2',
        className,
      )}
      style={[{ backgroundColor: `${color}22` }, style]}
    >
      <Icon size={compact ? 14 : 16} color={color} strokeWidth={2} />
      {!compact ? (
        <Text className="text-xs font-medium" style={{ color }} numberOfLines={1}>
          {t(`propertyTypes.${type}`)}
        </Text>
      ) : null}
    </View>
  );
}
