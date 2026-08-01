import { router } from 'expo-router';
import { Banknote, Building2, Receipt } from 'lucide-react-native';
import { Modal, Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Text } from '@/components/ui/text';
import { Colors } from '@/constants/theme';

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
  const { t } = useTranslation();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onDismiss}>
      <Pressable className="flex-1 justify-end bg-black/45" onPress={onDismiss}>
        <Pressable
          className="bg-card gap-4 rounded-t-[20px] px-6 pb-8 pt-2"
          onPress={(event) => event.stopPropagation()}
        >
          <View className="bg-border mb-2 h-1 w-9 self-center rounded-full" />

          <Text className="text-center text-base font-semibold">
            {t('dashboard.quickActions')}
          </Text>

          <View className="mt-2 gap-2">
            {ACTIONS.map((action) => {
              const Icon = action.icon;
              return (
                <Pressable
                  key={action.key}
                  className="border-border flex-row items-center gap-4 rounded-xl border p-4"
                  onPress={() => {
                    onDismiss();
                    router.push(action.route as never);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={t(action.labelKey)}
                >
                  <View
                    className="h-10 w-10 items-center justify-center rounded-full"
                    style={{ backgroundColor: `${action.color}22` }}
                  >
                    <Icon size={20} color={action.color} strokeWidth={2} />
                  </View>
                  <Text className="flex-1 text-base font-medium">{t(action.labelKey)}</Text>
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
