import { HeaderAction } from '@/components/ui/HeaderAction';

interface SearchHeaderButtonProps {
  active?: boolean;
  expanded?: boolean;
  onPress: () => void;
}

export function SearchHeaderButton({ active, expanded, onPress }: SearchHeaderButtonProps) {
  return <HeaderAction preset="search" active={active} expanded={expanded} onPress={onPress} />;
}
