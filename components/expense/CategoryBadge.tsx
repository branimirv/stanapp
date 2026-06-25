import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Text } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { getLucideIcon } from '@/utils/lucideIcons';
import { Spacing, Typography } from '@/constants/theme';

export interface CategoryBadgeProps {
  categoryKey: string;
  icon: string;
  color: string;
  showLabel?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function CategoryBadge({
  categoryKey,
  icon,
  color,
  showLabel = true,
  style,
}: CategoryBadgeProps) {
  const { t } = useTranslation();
  const Icon = getLucideIcon(icon);
  const label = t(`categories.${categoryKey}`, { defaultValue: categoryKey });

  return (
    <View style={[styles.badge, { backgroundColor: `${color}22` }, style]}>
      <Icon size={16} color={color} strokeWidth={2} />
      {showLabel ? (
        <Text style={[styles.label, { color }]} numberOfLines={1}>
          {label}
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
  label: {
    ...Typography.labelMedium,
  },
});
