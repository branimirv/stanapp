import {
  CircleAlert,
  CircleCheck,
  LogOut,
  Trash2,
  UserMinus,
  type LucideIcon,
} from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { BlurOverlay } from '@/components/ui/BlurOverlay';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Fonts } from '@/lib/fonts';
import {
  useUiStore,
  type ConfirmDialogIcon,
} from '@/stores/uiStore';

const CONFIRM_BLUR_MS = 220;

const ICONS: Record<ConfirmDialogIcon, LucideIcon> = {
  logOut: LogOut,
  userMinus: UserMinus,
  trash: Trash2,
  alert: CircleAlert,
  check: CircleCheck,
};

function translateLabel(t: (key: string) => string, label: string): string {
  if (label.includes('.')) {
    return t(label);
  }
  return label;
}

function resolveIcon(
  icon: ConfirmDialogIcon | undefined,
  destructive: boolean,
): ConfirmDialogIcon {
  if (icon) return icon;
  return destructive ? 'alert' : 'check';
}

export function ConfirmDialog() {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const { colors, elevation, radius } = theme;
  const confirmDialog = useUiStore((state) => state.confirmDialog);
  const hideConfirmDialog = useUiStore((state) => state.hideConfirmDialog);

  const handleConfirm = () => {
    confirmDialog.onConfirm?.();
    hideConfirmDialog();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) hideConfirmDialog();
  };

  const iconKey = resolveIcon(confirmDialog.icon, confirmDialog.destructive);
  const Icon = ICONS[iconKey];
  const iconBg = confirmDialog.destructive ? colors.negTint : colors.primaryTint;
  const iconFg = confirmDialog.destructive ? colors.neg : colors.primary;
  const confirmBg = confirmDialog.destructive ? colors.neg : colors.primary;
  const confirmFg = confirmDialog.destructive ? colors.onNeg : colors.onPrimary;

  return (
    <>
      {/* Blur sibling of dialog portal — never inside FullWindowOverlay (see docs/blur). */}
      <BlurOverlay
        visible={confirmDialog.visible}
        intensity="strong"
        tint="dark"
        duration={CONFIRM_BLUR_MS}
        zIndex={40}
      />

      <AlertDialog open={confirmDialog.visible} onOpenChange={handleOpenChange}>
        <AlertDialogContent
          overlayClassName="bg-transparent"
          className="w-full max-w-none border-0 bg-transparent p-0 shadow-none"
          style={styles.contentReset}
        >
          <View
            style={[
              styles.modal,
              {
                backgroundColor: colors.surface,
                borderColor: colors.cardBd,
                borderRadius: radius.xl,
                ...elevation.modal,
              },
            ]}
          >
            <View style={[styles.iconWell, { backgroundColor: iconBg }]}>
              <Icon size={21} color={iconFg} strokeWidth={2} />
            </View>

            <AlertDialogTitle
              style={{
                fontFamily: Fonts.sans.bold,
                fontSize: 18,
                letterSpacing: -0.18,
                color: colors.fg,
                marginBottom: 8,
              }}
            >
              {confirmDialog.title}
            </AlertDialogTitle>

            <AlertDialogDescription
              style={{
                fontFamily: Fonts.sans.regular,
                fontSize: 13,
                lineHeight: 20,
                color: colors.muted,
                marginBottom: 22,
              }}
            >
              {confirmDialog.message}
            </AlertDialogDescription>

            <Pressable
              onPress={handleConfirm}
              accessibilityRole="button"
              accessibilityLabel={translateLabel(t, confirmDialog.confirmLabel)}
              style={[styles.btn, { backgroundColor: confirmBg, marginBottom: 10 }]}
            >
              <Text
                style={{
                  fontFamily: Fonts.sans.semibold,
                  fontSize: 15,
                  letterSpacing: -0.15,
                  color: confirmFg,
                }}
              >
                {translateLabel(t, confirmDialog.confirmLabel)}
              </Text>
            </Pressable>

            <Pressable
              onPress={hideConfirmDialog}
              accessibilityRole="button"
              accessibilityLabel={translateLabel(t, confirmDialog.cancelLabel)}
              style={[styles.btn, { backgroundColor: colors.surface2 }]}
            >
              <Text
                style={{
                  fontFamily: Fonts.sans.semibold,
                  fontSize: 15,
                  letterSpacing: -0.15,
                  color: colors.fg,
                }}
              >
                {translateLabel(t, confirmDialog.cancelLabel)}
              </Text>
            </Pressable>
          </View>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

const styles = StyleSheet.create({
  contentReset: {
    width: '100%',
    alignSelf: 'stretch',
    maxWidth: undefined,
    gap: 0,
  },
  modal: {
    alignSelf: 'stretch',
    marginHorizontal: 14,
    paddingTop: 26,
    paddingHorizontal: 22,
    paddingBottom: 22,
    borderWidth: 1,
  },
  iconWell: {
    width: 44,
    height: 44,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  btn: {
    minHeight: 48,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
});
