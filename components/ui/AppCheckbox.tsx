import { Pressable } from 'react-native';

import { Checkbox } from '@/components/ui/checkbox';
import { Text } from '@/components/ui/text';

interface AppCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}

export function AppCheckbox({ checked, onChange, label }: AppCheckboxProps) {
  return (
    <Pressable
      className="flex-row items-center gap-2"
      onPress={() => onChange(!checked)}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
    >
      <Checkbox checked={checked} onCheckedChange={onChange} className="size-5 rounded-md" />
      <Text className="text-muted-foreground text-sm">{label}</Text>
    </Pressable>
  );
}
