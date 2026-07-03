import { StyleSheet, View } from 'react-native';

import { HEADER_EDGE_INSET } from '@/constants/header';

interface HeaderEdgeInsetProps {
  children?: React.ReactNode;
}

/**
 * Wraps header content so it lines up with the screen's horizontal edge padding,
 * mirroring the native header inset. Use `HeaderLeftInset` for `headerLeft`
 * content and `HeaderRightInset` for `headerRight` content.
 */
export function HeaderLeftInset({ children }: HeaderEdgeInsetProps) {
  return <View style={styles.left}>{children}</View>;
}

export function HeaderRightInset({ children }: HeaderEdgeInsetProps) {
  return <View style={styles.right}>{children}</View>;
}

const styles = StyleSheet.create({
  left: {
    paddingLeft: HEADER_EDGE_INSET,
  },
  right: {
    paddingRight: HEADER_EDGE_INSET,
  },
});
