import { router } from 'expo-router';
import {
  ArrowDownToLine,
  Building2,
  Receipt,
  type LucideIcon,
} from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import {
  AppBottomSheet,
  APP_BOTTOM_SHEET_CLOSE_MS,
} from '@/components/ui/AppBottomSheet';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Fonts } from '@/lib/fonts';

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
    if (tint === 'neg') return { bg: colors.negTint, fg: colors.neg };
    if (tint === 'pos') return { bg: colors.posTint, fg: colors.pos };
    return { bg: colors.primaryTint, fg: colors.primary };
  };

  return (
    <AppBottomSheet
      visible={visible}
      onDismiss={onDismiss}
      title={t('dashboard.quickActions')}
    >
      <View style={styles.actions}>
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
              style={[styles.actionRow, { backgroundColor: colors.surface2 }]}
            >
              <View style={[styles.iconWell, { backgroundColor: tint.bg }]}>
                <Icon size={20} color={tint.fg} strokeWidth={2} />
              </View>
              <Text
                style={{
                  fontFamily: Fonts.sans.semibold,
                  fontSize: 15,
                  letterSpacing: -0.15,
                  color: colors.fg,
                  flex: 1,
                }}
              >
                {t(action.labelKey)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </AppBottomSheet>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: 10,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    height: 56,
    paddingHorizontal: 14,
    borderRadius: 999,
  },
  iconWell: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
