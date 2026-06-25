import { Link, Tabs } from 'expo-router';
import {
  BarChart3,
  Building2,
  LayoutDashboard,
  Receipt,
  Settings,
} from 'lucide-react-native';
import { Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'react-native-paper';
import { Colors } from '@/constants/theme';

export default function TabLayout() {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        headerStyle: {
          backgroundColor: theme.dark ? Colors.surfaceDark : Colors.surface,
        },
        headerTintColor: theme.colors.onSurface,
        tabBarStyle: {
          backgroundColor: theme.dark ? Colors.surfaceDark : Colors.surface,
          borderTopColor: theme.dark ? Colors.borderDark : Colors.border,
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
          headerRight: () => (
            <Link href="/settings" asChild>
              <Pressable
                style={{ marginRight: 16 }}
                accessibilityRole="button"
                accessibilityLabel={t('settings.title')}
              >
                {({ pressed }) => (
                  <Settings
                    size={22}
                    color={theme.colors.onSurface}
                    strokeWidth={2}
                    opacity={pressed ? 0.5 : 1}
                  />
                )}
              </Pressable>
            </Link>
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
