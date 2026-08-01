import { router } from 'expo-router';
import { Banknote, Building2, Receipt } from 'lucide-react-native';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { Colors, Spacing, Typography } from '@/constants/theme';

interface QuickCreateSheetProps {
  visible: boolean;
  onDismiss: () => void;
}

const ACTIONS = [
  {
    key: 'expense',
    labelKey: 'dashboard.addExpense',
    icon: Receipt,
    route: '/expense/new',
    color: Colors.danger,
  },
  {
    key: 'payment',
    labelKey: 'dashboard.addPayment',
    icon: Banknote,
    route: '/rent/new',
    color: Colors.accent,
  },
  {
    key: 'property',
    labelKey: 'dashboard.addProperty',
    icon: Building2,
    route: '/property/new',
    color: Colors.primary,
  },
] as const;

export function QuickCreateSheet({ visible, onDismiss }: QuickCreateSheetProps) {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onDismiss}>
      <Pressable style={styles.overlay} onPress={onDismiss}>
        <Pressable
          style={[styles.content, { backgroundColor: theme.colors.surface }]}
          onPress={(event) => event.stopPropagation()}
        >
          <View style={[styles.handle, { backgroundColor: theme.colors.outlineVariant }]} />

          <Text style={[styles.title, { color: theme.colors.onSurface }]}>
            {t('dashboard.quickActions')}
          </Text>

          <View style={styles.actions}>
            {ACTIONS.map((action) => {
              const Icon = action.icon;
              return (
                <Pressable
                  key={action.key}
                  style={[styles.actionRow, { borderColor: theme.colors.outline }]}
                  onPress={() => {
                    onDismiss();
                    router.push(action.route as never);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={t(action.labelKey)}
                >
                  <View style={[styles.actionIcon, { backgroundColor: `${action.color}22` }]}>
                    <Icon size={20} color={action.color} strokeWidth={2} />
                  </View>
                  <Text style={[styles.actionLabel, { color: theme.colors.onSurface }]}>
                    {t(action.labelKey)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  content: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    gap: Spacing.md,
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    marginBottom: Spacing.sm,
  },
  title: {
    ...Typography.titleMedium,
    textAlign: 'center',
  },
  actions: {
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    ...Typography.titleMedium,
    flex: 1,
  },
});
