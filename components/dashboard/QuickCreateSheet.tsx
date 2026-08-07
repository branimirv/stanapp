import { router } from 'expo-router';
import {
  ArrowDownToLine,
  Building2,
  Receipt,
  type LucideIcon,
} from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import {
  AppBottomSheet,
  APP_BOTTOM_SHEET_CLOSE_MS,
} from '@/components/ui/AppBottomSheet';
import { useAppTheme } from '@/hooks/useAppTheme';
import { cn } from '@/lib/utils';

interface QuickCreateSheetProps {
  visible: boolean;
  onDismiss: () => void;
}

const ACTIONS: {
  key: string;
  labelKey: string;
  icon: LucideIcon;
  route: '/property/new' | '/expense/new' | '/rent/new';
  tint: 'primary' | 'neg' | 'pos';
}[] = [
  {
    key: 'property',
    labelKey: 'dashboard.addProperty',
    icon: Building2,
    route: '/property/new',
    tint: 'primary',
  },
  {
    key: 'expense',
    labelKey: 'dashboard.addExpense',
    icon: Receipt,
    route: '/expense/new',
    tint: 'neg',
  },
  {
    key: 'payment',
    labelKey: 'dashboard.addPayment',
    icon: ArrowDownToLine,
    route: '/rent/new',
    tint: 'pos',
  },
];

/** @deprecated Prefer APP_BOTTOM_SHEET_CLOSE_MS from AppBottomSheet. */
export const QUICK_CREATE_CLOSE_MS = APP_BOTTOM_SHEET_CLOSE_MS;

/**
 * Dashboard quick-create actions.
 * Blur is a sibling on the screen — never inside the sheet Modal.
 */
export function QuickCreateSheet({ visible, onDismiss }: QuickCreateSheetProps) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const { colors } = theme;

  const tintFor = (tint: 'primary' | 'neg' | 'pos') => {
    if (tint === 'neg') return { well: 'bg-neg-tint' as const, fg: colors.neg };
    if (tint === 'pos') return { well: 'bg-pos-tint' as const, fg: colors.pos };
    return { well: 'bg-primary-tint' as const, fg: colors.primary };
  };

  return (
    <AppBottomSheet
      visible={visible}
      onDismiss={onDismiss}
      title={t('dashboard.quickActions')}
    >
      <View className="gap-2.5">
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          const tint = tintFor(action.tint);
          return (
            <Pressable
              key={action.key}
              onPress={() => {
                onDismiss();
                router.push(action.route);
              }}
              accessibilityRole="button"
              accessibilityLabel={t(action.labelKey)}
              className="bg-surface-2 h-14 flex-row items-center gap-3.5 rounded-full px-3.5"
            >
              <View
                className={cn(
                  'h-10 w-10 items-center justify-center rounded-full',
                  tint.well,
                )}
              >
                <Icon size={20} color={tint.fg} strokeWidth={2} />
              </View>
              <Text className="text-fg flex-1 text-[15px] font-semibold tracking-[-0.15px]">
                {t(action.labelKey)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </AppBottomSheet>
  );
}
