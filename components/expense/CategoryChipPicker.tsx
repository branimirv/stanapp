import { useCallback, useEffect, useRef } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type LayoutChangeEvent,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import { CategoryBadge } from '@/components/expense/CategoryBadge';
import { Text } from '@/components/ui/text';
import { Spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Fonts } from '@/lib/fonts';
import type { ExpenseCategory } from '@/types/app.types';

export interface CategoryChipPickerProps {
  categories: ExpenseCategory[];
  value: string | null;
  onValueChange: (categoryId: string) => void;
  onAddCustom?: () => void;
  label?: string;
  error?: string;
}

type ChipLayout = { x: number; width: number };

/**
 * Naslov `.pscroll` category chips — bleeds past form gutter so pills
 * clip at the screen edge; selected chip scrolls fully into view.
 */
export function CategoryChipPicker({
  categories,
  value,
  onValueChange,
  onAddCustom,
  label,
  error,
}: CategoryChipPickerProps) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const { colors } = theme;
  const gutter = theme.spacing.gutter;

  const scrollRef = useRef<ScrollView>(null);
  const layoutsRef = useRef<Record<string, ChipLayout>>({});
  const viewportWidthRef = useRef(0);
  const scrollXRef = useRef(0);

  const scrollChipIntoView = useCallback(
    (categoryId: string) => {
      const layout = layoutsRef.current[categoryId];
      const viewportWidth = viewportWidthRef.current;
      if (!layout || viewportWidth <= 0) return;

      const edgePad = gutter;
      const chipLeft = layout.x;
      const chipRight = layout.x + layout.width;
      const visibleLeft = scrollXRef.current;
      const visibleRight = scrollXRef.current + viewportWidth;

      let nextX = scrollXRef.current;
      if (chipRight > visibleRight - edgePad) {
        nextX = chipRight - viewportWidth + edgePad;
      } else if (chipLeft < visibleLeft + edgePad) {
        nextX = Math.max(0, chipLeft - edgePad);
      } else {
        return;
      }

      scrollRef.current?.scrollTo({ x: Math.max(0, nextX), animated: true });
    },
    [gutter],
  );

  useEffect(() => {
    if (!value) return;
    const frame = requestAnimationFrame(() => scrollChipIntoView(value));
    return () => cancelAnimationFrame(frame);
  }, [value, categories, scrollChipIntoView]);

  const handleViewportLayout = (event: LayoutChangeEvent) => {
    viewportWidthRef.current = event.nativeEvent.layout.width;
    if (value) {
      requestAnimationFrame(() => scrollChipIntoView(value));
    }
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollXRef.current = event.nativeEvent.contentOffset.x;
  };

  const handleChipLayout = (categoryId: string, event: LayoutChangeEvent) => {
    const { x, width } = event.nativeEvent.layout;
    layoutsRef.current[categoryId] = { x, width };
    if (categoryId === value) {
      requestAnimationFrame(() => scrollChipIntoView(categoryId));
    }
  };

  const handleSelect = (categoryId: string) => {
    onValueChange(categoryId);
    requestAnimationFrame(() => scrollChipIntoView(categoryId));
  };

  return (
    <View style={styles.container}>
      {label ? (
        <Text
          style={{
            fontFamily: Fonts.sans.semibold,
            fontSize: 12.5,
            lineHeight: 16,
            color: colors.fg,
            marginBottom: 8,
          }}
        >
          {label}
        </Text>
      ) : null}

      {categories.length === 0 && !onAddCustom ? (
        <Text
          style={{
            fontFamily: Fonts.sans.regular,
            fontSize: 14,
            color: colors.muted,
            paddingVertical: 8,
          }}
        >
          {t('expenses.noCategories')}
        </Text>
      ) : (
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginHorizontal: -gutter }}
          contentContainerStyle={[
            styles.chipRow,
            { paddingLeft: gutter, paddingRight: gutter + 28 },
          ]}
          keyboardShouldPersistTaps="handled"
          decelerationRate="fast"
          onLayout={handleViewportLayout}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {categories.map((category) => {
            const selected = category.id === value;
            return (
              <Pressable
                key={category.id}
                onPress={() => handleSelect(category.id)}
                onLayout={(event) => handleChipLayout(category.id, event)}
                style={[
                  styles.chip,
                  {
                    borderColor: selected ? colors.primary : 'transparent',
                    backgroundColor: selected ? colors.primaryTint : `${category.color}22`,
                  },
                ]}
                accessibilityRole="button"
                accessibilityState={{ selected }}
              >
                <CategoryBadge
                  categoryKey={category.key}
                  categoryName={category.name}
                  icon={category.icon}
                  color={selected ? colors.primary : category.color}
                  style={{ backgroundColor: 'transparent' }}
                />
              </Pressable>
            );
          })}
          {onAddCustom ? (
            <Pressable
              onPress={onAddCustom}
              style={[styles.addCustomChip, { borderColor: colors.primary }]}
              accessibilityRole="button"
              accessibilityLabel={t('expenses.addCustomCategory')}
            >
              <Text
                style={{
                  fontFamily: Fonts.sans.semibold,
                  fontSize: 12,
                  color: colors.primary,
                }}
              >
                + {t('expenses.addCustomCategory')}
              </Text>
            </Pressable>
          ) : null}
        </ScrollView>
      )}

      {error ? (
        <Text
          style={{
            fontFamily: Fonts.sans.regular,
            fontSize: 14,
            color: colors.neg,
            marginTop: 6,
          }}
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'visible',
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 2,
  },
  chip: {
    borderRadius: 999,
    borderWidth: 1.5,
    flexShrink: 0,
  },
  addCustomChip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.xs,
    justifyContent: 'center',
    alignSelf: 'center',
    flexShrink: 0,
  },
});
