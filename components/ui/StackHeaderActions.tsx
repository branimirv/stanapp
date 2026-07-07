import { HeaderActionsPill } from '@/components/ui/HeaderActionsPill';
import { SettingsHeaderButton } from '@/components/ui/SettingsHeaderButton';

interface StackHeaderActionsProps {
  children?: React.ReactNode;
}

export function StackHeaderActions({ children }: StackHeaderActionsProps) {
  return (
    <HeaderActionsPill>
      {children}
      <SettingsHeaderButton />
    </HeaderActionsPill>
  );
}
