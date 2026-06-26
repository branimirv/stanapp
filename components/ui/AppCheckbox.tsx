import { Check } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

import { Typography } from '@/constants/theme';

interface AppCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}

export function AppCheckbox({ checked, onChange, label }: AppCheckboxProps) {
  const theme = useTheme();

  return (
    <Pressable
      style={styles.row}
      onPress={() => onChange(!checked)}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
    >
      <View
        style={[
          styles.box,
          {
            borderColor: checked ? theme.colors.primary : theme.colors.outline,
            backgroundColor: checked ? theme.colors.primary : 'transparent',
          },
        ]}
      >
        {checked ? <Check size={14} color={theme.colors.onPrimary} strokeWidth={3} /> : null}
      </View>
      <Text style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  box: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...Typography.bodyMedium,
  },
});
