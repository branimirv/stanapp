import {
  CircleAlert,
  CircleCheck,
  LogOut,
  Trash2,
  UserMinus,
  type LucideIcon,
} from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { BlurOverlay } from '@/components/ui/BlurOverlay';
import { useAppTheme } from '@/hooks/useAppTheme';
import { cn } from '@/lib/utils';
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
  const { colors, elevation } = theme;
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
          className="w-full max-w-none self-stretch gap-0 border-0 bg-transparent p-0 shadow-none"
        >
          <View
            className="border-card-bd bg-surface mx-3.5 self-stretch rounded-xl border px-5.5 pt-6.5 pb-5.5"
            style={elevation.modal}
          >
            <View
              className={cn(
                'mb-3.5 h-11 w-11 items-center justify-center rounded-full',
                confirmDialog.destructive ? 'bg-neg-tint' : 'bg-primary-tint',
              )}
            >
              <Icon
                size={21}
                color={confirmDialog.destructive ? colors.neg : colors.primary}
                strokeWidth={2}
              />
            </View>

            <AlertDialogTitle className="text-fg mb-2 text-lg font-bold tracking-[-0.18px]">
              {confirmDialog.title}
            </AlertDialogTitle>

            <AlertDialogDescription className="text-muted mb-5.5 text-[13px] leading-5">
              {confirmDialog.message}
            </AlertDialogDescription>

            <Pressable
              onPress={handleConfirm}
              accessibilityRole="button"
              accessibilityLabel={translateLabel(t, confirmDialog.confirmLabel)}
              className={cn(
                'mb-2.5 min-h-12 items-center justify-center rounded-full px-4.5',
                confirmDialog.destructive ? 'bg-neg' : 'bg-primary',
              )}
            >
              <Text
                className={cn(
                  'text-[15px] font-semibold tracking-[-0.15px]',
                  confirmDialog.destructive ? 'text-on-neg' : 'text-on-primary',
                )}
              >
                {translateLabel(t, confirmDialog.confirmLabel)}
              </Text>
            </Pressable>

            <Pressable
              onPress={hideConfirmDialog}
              accessibilityRole="button"
              accessibilityLabel={translateLabel(t, confirmDialog.cancelLabel)}
              className="bg-surface-2 min-h-12 items-center justify-center rounded-full px-4.5"
            >
              <Text className="text-fg text-[15px] font-semibold tracking-[-0.15px]">
                {translateLabel(t, confirmDialog.cancelLabel)}
              </Text>
            </Pressable>
          </View>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
