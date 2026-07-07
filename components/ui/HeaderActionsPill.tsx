import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from 'react-native-paper';

import { HEADER_PILL_PADDING } from '@/constants/header';

interface HeaderActionsPillProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function HeaderActionsPill({ children, style }: HeaderActionsPillProps) {
  const theme = useTheme();
  const isDark = theme.dark;

  return (
    <View
      style={[
        styles.pill,
        {
          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(15, 23, 42, 0.06)',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(15, 23, 42, 0.08)',
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: HEADER_PILL_PADDING,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
