import { router } from 'expo-router';
import {
  ArrowDownToLine,
  Building2,
  ChartColumn,
  Receipt,
  type LucideIcon,
} from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useAppTheme } from '@/hooks/useAppTheme';

interface QuickAction {
  key: string;
  labelKey: string;
  icon: LucideIcon;
  onPress: () => void;
}

export function DashboardQuickActions() {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const { colors } = theme;

  const actions: QuickAction[] = [
    {
      key: 'property',
      labelKey: 'dashboard.qaProperty',
      icon: Building2,
      onPress: () => router.push('/property/new'),
    },
    {
      key: 'collect',
      labelKey: 'dashboard.qaCollect',
      icon: ArrowDownToLine,
      onPress: () => router.push('/rent/new'),
    },
    {
      key: 'expense',
      labelKey: 'dashboard.qaExpense',
      icon: Receipt,
      onPress: () => router.push('/expense/new'),
    },
    {
      key: 'reports',
      labelKey: 'dashboard.qaReports',
      icon: ChartColumn,
      onPress: () => router.push('/(tabs)/reports'),
    },
  ];

  return (
    <View className="mb-5 flex-row gap-1.5">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Pressable
            key={action.key}
            onPress={action.onPress}
            className="flex-1 items-center gap-2.25"
            accessibilityRole="button"
            accessibilityLabel={t(action.labelKey)}
          >
            <View className="bg-surface-2 h-12 w-12 items-center justify-center rounded-full">
              <Icon size={20} color={colors.primary} strokeWidth={2} />
            </View>
            <Text
              className="text-muted text-center text-[10px] font-semibold uppercase tracking-[0.8px]"
              numberOfLines={1}
            >
              {t(action.labelKey)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
