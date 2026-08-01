import { HeaderAction } from '@/components/ui/HeaderAction';

interface CreateHeaderButtonProps {
  onPress: () => void;
  accessibilityLabel?: string;
}

export function CreateHeaderButton({ onPress, accessibilityLabel }: CreateHeaderButtonProps) {
  return (
    <HeaderAction preset="create" onPress={onPress} accessibilityLabel={accessibilityLabel} />
  );
}
