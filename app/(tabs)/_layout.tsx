import { Tabs } from 'expo-router';
import { BarChart3, Building2, LayoutDashboard, Receipt } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'react-native-paper';

import { GlassTabBar } from '@/components/ui/GlassTabBar';
import { useAppHeaderOptions } from '@/hooks/useAppHeaderOptions';

export default function TabLayout() {
  const { t } = useTranslation();
  const theme = useTheme();
  const headerOptions = useAppHeaderOptions({ variant: 'tabRoot' });

  return (
    <Tabs
      tabBar={(props) => <GlassTabBar {...props} />}
      screenOptions={{
        ...headerOptions,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.dashboard'),
          tabBarIcon: ({ color, size }) => (
            <LayoutDashboard color={color} size={size ?? 24} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="properties"
        options={{
          title: t('tabs.properties'),
          tabBarIcon: ({ color, size }) => (
            <Building2 color={color} size={size ?? 24} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="expenses"
        options={{
          title: t('tabs.expenses'),
          tabBarIcon: ({ color, size }) => (
            <Receipt color={color} size={size ?? 24} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: t('tabs.reports'),
          tabBarIcon: ({ color, size }) => (
            <BarChart3 color={color} size={size ?? 24} strokeWidth={2} />
          ),
        }}
      />
    </Tabs>
  );
}
