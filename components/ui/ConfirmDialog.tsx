import { useTranslation } from 'react-i18next';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Text } from '@/components/ui/text';
import { useUiStore } from '@/stores/uiStore';

function translateLabel(t: (key: string) => string, label: string): string {
  if (label.includes('.')) {
    return t(label);
  }
  return label;
}

export function ConfirmDialog() {
  const { t } = useTranslation();
  const confirmDialog = useUiStore((state) => state.confirmDialog);
  const hideConfirmDialog = useUiStore((state) => state.hideConfirmDialog);

  const handleConfirm = () => {
    confirmDialog.onConfirm?.();
    hideConfirmDialog();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) hideConfirmDialog();
  };

  return (
    <AlertDialog open={confirmDialog.visible} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{confirmDialog.title}</AlertDialogTitle>
          <AlertDialogDescription>{confirmDialog.message}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onPress={hideConfirmDialog}>
            <Text>{translateLabel(t, confirmDialog.cancelLabel)}</Text>
          </AlertDialogCancel>
          <AlertDialogAction
            onPress={handleConfirm}
            className={confirmDialog.destructive ? 'bg-destructive' : undefined}
          >
            <Text className="text-primary-foreground">
              {translateLabel(t, confirmDialog.confirmLabel)}
            </Text>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
