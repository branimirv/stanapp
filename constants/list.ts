import { Platform } from 'react-native';

/**
 * removeClippedSubviews has a long tail of "blank row" reports on iOS, and every
 * list in the app renders gesture-handler rows, so the win stays Android-only.
 */
const removeClippedSubviews = Platform.OS === 'android';

/**
 * Shared virtualization settings for FlatList / SectionList.
 *
 * The library default keeps a 21-viewport render window mounted, which is far
 * more than any screen here scrolls through in one gesture. Spread these props
 * onto a list to trade a small risk of blank space during a fast fling for a
 * much smaller mounted tree.
 */
export const listPerformanceProps = {
  removeClippedSubviews,
  initialNumToRender: 8,
  maxToRenderPerBatch: 8,
  windowSize: 11,
  updateCellsBatchingPeriod: 50,
} as const;
