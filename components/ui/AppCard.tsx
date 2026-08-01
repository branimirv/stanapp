import { Pressable, type StyleProp, type ViewStyle } from 'react-native';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface AppCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  className?: string;
}

export function AppCard({ children, style, onPress, className }: AppCardProps) {
  const content = (
    <Card className={cn('gap-0 rounded-2xl p-4 py-4', className)} style={style}>
      {children}
    </Card>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} accessibilityRole="button">
        {content}
      </Pressable>
    );
  }

  return content;
}
