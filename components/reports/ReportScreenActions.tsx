import { Download } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { FilterIconButton } from '@/components/ui/FilterIconButton';
import { FloatingScreenActions } from '@/components/ui/FloatingScreenActions';
import { HeaderBtnIco } from '@/components/ui/HeaderActionsPill';
import { HEADER_ICON_SIZE } from '@/constants/header';
import { useAppTheme } from '@/hooks/useAppTheme';

interface ReportScreenActionsProps {
  activeFilterCount?: number;
  onFilterPress: () => void;
  onDownloadPress: () => void;
  downloadDisabled?: boolean;
}

/** Floating filter (left) + download (right) for the reports tab. */
export function ReportScreenActions({
  activeFilterCount = 0,
  onFilterPress,
  onDownloadPress,
  downloadDisabled = false,
}: ReportScreenActionsProps) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();

  const filtersAccessibilityLabel =
    activeFilterCount > 0
      ? t('reports.filtersWithCount', { count: activeFilterCount })
      : t('reports.filters');

  return (
    <>
      <FloatingScreenActions align="left">
        <FilterIconButton
          activeCount={activeFilterCount}
          onPress={onFilterPress}
          accessibilityLabel={filtersAccessibilityLabel}
        />
      </FloatingScreenActions>

      <FloatingScreenActions align="right">
        <HeaderBtnIco
          onPress={onDownloadPress}
          accessibilityLabel={t('reports.export')}
          disabled={downloadDisabled}
        >
          <Download size={HEADER_ICON_SIZE} color={theme.colors.fg} strokeWidth={2} />
        </HeaderBtnIco>
      </FloatingScreenActions>
    </>
  );
}
