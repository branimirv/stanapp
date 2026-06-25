import type { LucideIcon } from 'lucide-react-native';
import * as LucideIcons from 'lucide-react-native';

export function getLucideIcon(name: string): LucideIcon {
  const icon = (LucideIcons as unknown as Record<string, LucideIcon | undefined>)[name];
  return icon ?? LucideIcons.MoreHorizontal;
}
