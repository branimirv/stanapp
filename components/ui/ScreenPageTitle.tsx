import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

interface ScreenPageTitleProps {
  children: string;
  className?: string;
  numberOfLines?: number;
}

/**
 * Full-width screen title for stack content (not the floating header).
 * Prefer this over a centered nav title so long strings can wrap.
 */
export function ScreenPageTitle({
  children,
  className,
  numberOfLines = 2,
}: ScreenPageTitleProps) {
  return (
    <Text
      className={cn('text-foreground text-2xl leading-8 font-bold', className)}
      numberOfLines={numberOfLines}
      accessibilityRole="header"
    >
      {children}
    </Text>
  );
}
