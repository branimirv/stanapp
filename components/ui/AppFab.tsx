import type { LucideIcon } from 'lucide-react-native';
import { Plus } from 'lucide-react-native';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { FAB, type FABProps } from 'react-native-paper';
import { Spacing } from '@/constants/theme';

type AppFabProps = Omit<FABProps, 'icon'> & {
  icon?: LucideIcon;
};

export function AppFab({
  icon: Icon = Plus,
  style,
  ...rest
}: AppFabProps) {
  return (
    <FAB
      icon={({ size, color }) => <Icon size={size} color={color} strokeWidth={2} />}
      style={[styles.fab, style]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  fab: {
    marginRight: Spacing.md,
  },
});
