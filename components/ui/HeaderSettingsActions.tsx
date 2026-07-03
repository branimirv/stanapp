import { HeaderActionsPill } from '@/components/ui/HeaderActionsPill';
import { HeaderRightInset } from '@/components/ui/HeaderEdgeInset';
import { SettingsHeaderButton } from '@/components/ui/SettingsHeaderButton';

export function HeaderSettingsActions() {
  return (
    <HeaderRightInset>
      <HeaderActionsPill>
        <SettingsHeaderButton />
      </HeaderActionsPill>
    </HeaderRightInset>
  );
}
