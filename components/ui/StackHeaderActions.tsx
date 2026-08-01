import { Children, type ReactNode } from 'react';

import { HeaderActionsPill } from '@/components/ui/HeaderActionsPill';

interface StackHeaderActionsProps {
  children?: ReactNode;
}

export function StackHeaderActions({ children }: StackHeaderActionsProps) {
  const actions = Children.toArray(children).filter(Boolean);
  if (actions.length === 0) return null;

  return <HeaderActionsPill>{actions}</HeaderActionsPill>;
}
