import { View, type StyleProp, type ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { getCategoryLabel } from '@/utils/expense';
import { getLucideIcon } from '@/utils/lucideIcons';

export interface CategoryBadgeProps {
  categoryKey: string;
  categoryName?: string | null;
  icon: string;
  color: string;
  showLabel?: boolean;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

export function CategoryBadge({
  categoryKey,
  categoryName,
  icon,
  color,
  showLabel = true,
  style,
  className,
}: CategoryBadgeProps) {
  const { t } = useTranslation();
  const Icon = getLucideIcon(icon);
  const label = getCategoryLabel({ key: categoryKey, name: categoryName ?? null }, t);

  return (
    <View
      className={cn(
        'max-w-full flex-row items-center gap-1 self-start rounded-full px-2.5 py-1',
        className,
      )}
      style={[{ backgroundColor: `${color}22` }, style]}
    >
      <Icon size={16} color={color} strokeWidth={2} />
      {showLabel ? (
        <Text className="text-xs font-medium" style={{ color }} numberOfLines={1}>
          {label}
        </Text>
      ) : null}
    </View>
  );
}
