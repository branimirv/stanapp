import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

interface HeaderActionsPillProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

/** Horizontal group for header action icons — no background, sits on the header bar. */
export function HeaderActionsPill({ children, style }: HeaderActionsPillProps) {
  return <View style={[styles.group, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  group: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
