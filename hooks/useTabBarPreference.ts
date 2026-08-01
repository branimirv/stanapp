import { useEffect } from 'react';

import { useTabBarStore } from '@/stores/tabBarStore';
import type { TabBarLabelMode } from '@/types/app.types';

export function useTabBarPreference() {
  const labelMode = useTabBarStore((s) => s.labelMode);
  const isHydrated = useTabBarStore((s) => s.isHydrated);
  const hydrate = useTabBarStore((s) => s.hydrate);
  const setLabelMode = useTabBarStore((s) => s.setLabelMode);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  return {
    labelMode,
    isHydrated,
    setLabelMode,
    showLabels: labelMode === 'iconAndLabel',
  };
}

export type { TabBarLabelMode };
