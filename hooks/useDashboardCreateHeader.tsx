import { useTranslation } from 'react-i18next';

import { CreateHeaderButton } from '@/components/ui/CreateHeaderButton';
import { FloatingScreenActions } from '@/components/ui/FloatingScreenActions';
import { HeaderActionsPill } from '@/components/ui/HeaderActionsPill';

/** Floating create action for the dashboard (no native header bar). */
export function DashboardCreateActions({ onCreatePress }: { onCreatePress: () => void }) {
  const { t } = useTranslation();

  return (
    <FloatingScreenActions align="right">
      <HeaderActionsPill>
        <CreateHeaderButton
          onPress={onCreatePress}
          accessibilityLabel={t('dashboard.quickActions')}
        />
      </HeaderActionsPill>
    </FloatingScreenActions>
  );
}
