import { SlidersHorizontal } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { FloatingScreenActions } from '@/components/ui/FloatingScreenActions';
import { HeaderAction } from '@/components/ui/HeaderAction';
import { HeaderActionsPill } from '@/components/ui/HeaderActionsPill';
import { Text } from '@/components/ui/text';

interface ExpenseScreenActionsProps {
  activeFilterCount?: number;
  onFilterPress: () => void;
}

/** Floating glass filter control (left) for the expenses tab. */
export function ExpenseScreenActions({
  activeFilterCount = 0,
  onFilterPress,
}: ExpenseScreenActionsProps) {
  const { t } = useTranslation();

  const filtersAccessibilityLabel =
    activeFilterCount > 0
      ? t('expenses.filtersWithCount', { count: activeFilterCount })
      : t('expenses.filters');

  return (
    <FloatingScreenActions align="left">
      <HeaderActionsPill>
        <View style={styles.filterSlot}>
          <HeaderAction
            icon={SlidersHorizontal}
            onPress={onFilterPress}
            accessibilityLabel={filtersAccessibilityLabel}
          />
          {activeFilterCount > 0 ? (
            <View style={styles.badge} className="bg-primary" pointerEvents="none">
              <Text className="text-primary-foreground text-[10px] font-bold">
                {activeFilterCount}
              </Text>
            </View>
          ) : null}
        </View>
      </HeaderActionsPill>
    </FloatingScreenActions>
  );
}

const styles = StyleSheet.create({
  filterSlot: {
    position: 'relative',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
});
