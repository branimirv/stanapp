import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react-native';
import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { Portal, Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { useUiStore, type ToastType } from '@/stores/uiStore';

const TAB_BAR_OFFSET = 56;

function getToastColors(type: ToastType) {
  switch (type) {
    case 'success':
      return {
        background: Colors.accent,
        foreground: Colors.textInverse,
        icon: CheckCircle2,
      };
    case 'error':
      return {
        background: Colors.danger,
        foreground: Colors.textInverse,
        icon: AlertCircle,
      };
    case 'warning':
      return {
        background: Colors.warning,
        foreground: Colors.textPrimary,
        icon: AlertTriangle,
      };
    case 'info':
    default:
      return {
        background: Colors.primary,
        foreground: Colors.textInverse,
        icon: Info,
      };
  }
}

export function Toast() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
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

  const { background, foreground, icon: Icon } = getToastColors(toast.type);

  return (
    <Portal>
      <View
        pointerEvents="box-none"
        style={[
          styles.wrapper,
          { bottom: insets.bottom + TAB_BAR_OFFSET + Spacing.sm },
        ]}
      >
        <Animated.View
          entering={FadeInDown.duration(250)}
          exiting={FadeOutDown.duration(200)}
          style={[styles.toast, { backgroundColor: background }]}
        >
          <Icon size={20} color={foreground} strokeWidth={2} />
          <Text
            style={[styles.message, { color: foreground }]}
            numberOfLines={3}
          >
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
    </Portal>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: Spacing.md,
    right: Spacing.md,
    zIndex: 9999,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  message: {
    ...Typography.bodyMedium,
    flex: 1,
  },
});
