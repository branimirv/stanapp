import { HeaderAction } from '@/components/ui/HeaderAction';

interface CreateHeaderButtonProps {
  onPress: () => void;
}

export function CreateHeaderButton({ onPress }: CreateHeaderButtonProps) {
  return <HeaderAction preset="create" onPress={onPress} />;
}
