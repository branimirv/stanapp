import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react-native';
import { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { Text } from '@/components/ui/text';
import { NATIVE_TAB_BAR_OFFSET } from '@/constants/tabBar';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { AppTheme } from '@/lib/theme';
import { useUiStore, type ToastType } from '@/stores/uiStore';

function getToastColors(type: ToastType, colors: AppTheme['colors']) {
  switch (type) {
    case 'success':
      return {
        background: colors.pos,
        foreground: colors.onPrimary,
        icon: CheckCircle2,
      };
    case 'error':
      return {
        background: colors.neg,
        foreground: colors.onNeg,
        icon: AlertCircle,
      };
    case 'warning':
      // No dedicated warning token in Naslov — chart slot 4 (gold) is the stand-in.
      return {
        background: colors.chart[4],
        foreground: colors.fg,
        icon: AlertTriangle,
      };
    case 'info':
    default:
      return {
        background: colors.primary,
        foreground: colors.onPrimary,
        icon: Info,
      };
  }
}

export function Toast() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const toast = useUiStore((state) => state.toast);
  const hideToast = useUiStore((state) => state.hideToast);

  useEffect(() => {
    if (!toast) return;

    const timeoutId = setTimeout(() => {
      hideToast();
    }, toast.duration);

    return () => clearTimeout(timeoutId);
  }, [toast, hideToast]);

  if (!toast) return null;

  const { background, foreground, icon: Icon } = getToastColors(toast.type, theme.colors);

  return (
    <View
      pointerEvents="box-none"
      className="absolute left-4 right-4 z-9999"
      style={{ bottom: insets.bottom + NATIVE_TAB_BAR_OFFSET + 8 }}
    >
      <Animated.View
        entering={FadeInDown.duration(250)}
        exiting={FadeOutDown.duration(200)}
        className="flex-row items-center gap-2 rounded-xl px-4 py-4 shadow-lg"
        style={{ backgroundColor: background }}
      >
        <Icon size={20} color={foreground} strokeWidth={2} />
        <Text className="flex-1 text-sm" style={{ color: foreground }} numberOfLines={3}>
          {toast.message}
        </Text>
        <Pressable
          onPress={hideToast}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={t('ui.dismissToast')}
        >
          <X size={18} color={foreground} strokeWidth={2} />
        </Pressable>
      </Animated.View>
    </View>
  );
}
