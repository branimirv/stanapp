import { router } from 'expo-router';
import { Banknote, BarChart3, Building2, Receipt } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { Colors, Spacing, Typography } from '@/constants/theme';

interface QuickAction {
  key: string;
  labelKey: string;
  icon: typeof Receipt;
  route: string;
  color: string;
}

const ACTIONS: QuickAction[] = [
  { key: 'expense', labelKey: 'dashboard.addExpense', icon: Receipt, route: '/expense/new', color: Colors.danger },
  { key: 'payment', labelKey: 'dashboard.addPayment', icon: Banknote, route: '/rent/new', color: Colors.accent },
  { key: 'property', labelKey: 'dashboard.addProperty', icon: Building2, route: '/property/new', color: Colors.primary },
  { key: 'reports', labelKey: 'dashboard.viewReports', icon: BarChart3, route: '/(tabs)/reports', color: '#8B5CF6' },
];

export function QuickActions() {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text style={[styles.heading, { color: theme.colors.onSurface }]}>
        {t('dashboard.quickActions')}
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <Pressable
              key={action.key}
              onPress={() => router.push(action.route as never)}
              style={[
                styles.action,
                {
                  backgroundColor: theme.dark ? Colors.surfaceDark : Colors.surface,
                  borderColor: theme.colors.outline,
                },
              ]}
              accessibilityRole="button"
            >
              <View style={[styles.iconWrap, { backgroundColor: `${action.color}22` }]}>
                <Icon size={20} color={action.color} strokeWidth={2} />
              </View>
              <Text
                style={[styles.label, { color: theme.colors.onSurface }]}
                numberOfLines={2}
              >
                {t(action.labelKey)}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  heading: {
    ...Typography.titleMedium,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingRight: Spacing.md,
  },
  action: {
    width: 96,
    borderRadius: 12,
    borderWidth: 1,
    padding: Spacing.sm,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...Typography.labelSmall,
    textAlign: 'center',
  },
});
