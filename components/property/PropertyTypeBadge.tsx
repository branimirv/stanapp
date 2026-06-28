import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Text } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { PROPERTY_TYPE_COLORS, PROPERTY_TYPE_ICONS } from '@/constants/propertyType';
import { Spacing, Typography } from '@/constants/theme';
import type { PropertyType } from '@/types/app.types';

export interface PropertyTypeBadgeProps {
  type: PropertyType;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function PropertyTypeBadge({ type, compact = false, style }: PropertyTypeBadgeProps) {
  const { t } = useTranslation();
  const Icon = PROPERTY_TYPE_ICONS[type];
  const color = PROPERTY_TYPE_COLORS[type];

  return (
    <View
      style={[
        styles.badge,
        compact && styles.badgeCompact,
        { backgroundColor: `${color}22` },
        style,
      ]}
    >
      <Icon size={compact ? 14 : 16} color={color} strokeWidth={2} />
      {!compact ? (
        <Text style={[styles.label, { color }]} numberOfLines={1}>
          {t(`propertyTypes.${type}`)}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: Spacing.xs,
    borderRadius: 999,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.xs,
    maxWidth: '100%',
  },
  badgeCompact: {
    paddingHorizontal: Spacing.sm,
  },
  label: {
    ...Typography.labelMedium,
  },
});
