import { router } from 'expo-router';
import {
  ArrowDownToLine,
  Building2,
  ChartColumn,
  Receipt,
  type LucideIcon,
} from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useAppTheme } from '@/hooks/useAppTheme';
import { Fonts } from '@/lib/fonts';

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
    <View style={styles.row}>
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Pressable
            key={action.key}
            onPress={action.onPress}
            style={styles.qa}
            accessibilityRole="button"
            accessibilityLabel={t(action.labelKey)}
          >
            <View style={[styles.circle, { backgroundColor: colors.surface2 }]}>
              <Icon size={20} color={colors.primary} strokeWidth={2} />
            </View>
            <Text
              style={{
                fontFamily: Fonts.sans.semibold,
                fontSize: 10,
                letterSpacing: 0.8,
                textTransform: 'uppercase',
                color: colors.muted,
                textAlign: 'center',
              }}
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

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 20,
  },
  qa: {
    flex: 1,
    alignItems: 'center',
    gap: 9,
  },
  circle: {
    width: 48,
    height: 48,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
