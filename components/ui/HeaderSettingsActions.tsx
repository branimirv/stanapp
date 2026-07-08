import { HeaderAction } from '@/components/ui/HeaderAction';
import { HeaderActionsPill } from '@/components/ui/HeaderActionsPill';

export function HeaderSettingsActions() {
  return (
    <HeaderActionsPill>
      <HeaderAction preset="settings" />
    </HeaderActionsPill>
  );
}
