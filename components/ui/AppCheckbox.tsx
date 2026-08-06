import { Pressable, Text } from 'react-native';

import { Checkbox } from '@/components/ui/checkbox';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Fonts } from '@/lib/fonts';

interface AppCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}

export function AppCheckbox({ checked, onChange, label }: AppCheckboxProps) {
  const { theme } = useAppTheme();

  return (
    <Pressable
      className="flex-row items-center gap-2"
      onPress={() => onChange(!checked)}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
    >
      <Checkbox
        checked={checked}
        onCheckedChange={onChange}
        className="border-bd-strong size-[19px] rounded-[6px] border-[1.5px]"
        checkedClassName="border-primary bg-primary"
        indicatorClassName="bg-primary"
        iconClassName="text-on-primary"
      />
      <Text
        style={{
          fontFamily: Fonts.sans.regular,
          fontSize: 14,
          lineHeight: 18,
          color: theme.colors.muted,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
