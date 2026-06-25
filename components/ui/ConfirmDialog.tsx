import { Portal, Dialog, Button, Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useUiStore } from '@/stores/uiStore';

function translateLabel(t: (key: string) => string, label: string): string {
  if (label.includes('.')) {
    return t(label);
  }
  return label;
}

export function ConfirmDialog() {
  const theme = useTheme();
  const { t } = useTranslation();
  const confirmDialog = useUiStore((state) => state.confirmDialog);
  const hideConfirmDialog = useUiStore((state) => state.hideConfirmDialog);

  const handleConfirm = () => {
    confirmDialog.onConfirm?.();
    hideConfirmDialog();
  };

  const handleDismiss = () => {
    hideConfirmDialog();
  };

  return (
    <Portal>
      <Dialog visible={confirmDialog.visible} onDismiss={handleDismiss}>
        <Dialog.Title>{confirmDialog.title}</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium">{confirmDialog.message}</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={handleDismiss}>
            {translateLabel(t, confirmDialog.cancelLabel)}
          </Button>
          <Button
            onPress={handleConfirm}
            textColor={confirmDialog.destructive ? theme.colors.error : undefined}
            buttonColor={confirmDialog.destructive ? undefined : theme.colors.primary}
            mode={confirmDialog.destructive ? 'text' : 'contained'}
          >
            {translateLabel(t, confirmDialog.confirmLabel)}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}
