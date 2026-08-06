import { Plus, Search } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { FloatingScreenActions } from '@/components/ui/FloatingScreenActions';
import { HeaderBtnIco } from '@/components/ui/HeaderActionsPill';
import { HEADER_ICON_SIZE } from '@/constants/header';
import { Spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';

interface SearchableTabActionsProps {
  showCreate?: boolean;
  onCreatePress?: () => void;
  searchActive: boolean;
  searchExpanded: boolean;
  onSearchPress: () => void;
  createAccessibilityLabel?: string;
}

/** Floating search + create (create last) for tab roots (no native header bar). */
export function SearchableTabActions({
  showCreate,
  onCreatePress,
  searchActive = false,
  searchExpanded,
  onSearchPress,
  createAccessibilityLabel,
}: SearchableTabActionsProps) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const { colors } = theme;
  const hasCreate = Boolean(showCreate && onCreatePress);
  const active = searchActive || searchExpanded;

  return (
    <FloatingScreenActions align="right">
      <View style={styles.row}>
        <HeaderBtnIco
          onPress={onSearchPress}
          accessibilityLabel={t('common.search')}
          active={active}
        >
          <Search
            size={HEADER_ICON_SIZE}
            color={active ? colors.primary : colors.fg}
            strokeWidth={2}
          />
        </HeaderBtnIco>
        {hasCreate ? (
          <HeaderBtnIco
            onPress={onCreatePress!}
            accessibilityLabel={createAccessibilityLabel ?? t('properties.addNew')}
          >
            <Plus size={HEADER_ICON_SIZE} color={colors.fg} strokeWidth={2} />
          </HeaderBtnIco>
        ) : null}
      </View>
    </FloatingScreenActions>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
});
