import { ActivityIndicator, type StyleProp, type ViewStyle } from 'react-native';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

type PaperMode = 'contained' | 'outlined' | 'text' | 'elevated' | 'contained-tonal';

export interface AppButtonProps {
  mode?: PaperMode;
  loading?: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  /** Paper compat — used for destructive outlined/text actions */
  textColor?: string;
  className?: string;
  accessibilityLabel?: string;
}

function mapModeToVariant(
  mode: PaperMode,
  textColor?: string,
): 'default' | 'outline' | 'ghost' | 'secondary' | 'destructive' {
  if (textColor) return 'destructive';
  switch (mode) {
    case 'outlined':
      return 'outline';
    case 'text':
      return 'ghost';
    case 'contained-tonal':
      return 'secondary';
    case 'elevated':
    case 'contained':
    default:
      return 'default';
  }
}

export function AppButton({
  loading = false,
  disabled,
  children,
  mode = 'contained',
  onPress,
  style,
  textColor,
  className,
  accessibilityLabel,
}: AppButtonProps) {
  const isDisabled = disabled || loading;
  const variant = mapModeToVariant(mode, textColor);

  return (
    <Button
      variant={variant}
      disabled={isDisabled}
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      className={cn('min-h-11 rounded-xl', className)}
      style={style}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'default' || variant === 'destructive' ? '#FFFFFF' : '#2563EB'}
        />
      ) : typeof children === 'string' || typeof children === 'number' ? (
        <Text>{children}</Text>
      ) : (
        children
      )}
    </Button>
  );
}
