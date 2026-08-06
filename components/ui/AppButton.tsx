import { ActivityIndicator, Text, type StyleProp, type ViewStyle } from 'react-native';

import { Button } from '@/components/ui/button';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Fonts } from '@/lib/fonts';
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
  const { theme } = useAppTheme();
  const isDisabled = disabled || loading;
  const variant = mapModeToVariant(mode, textColor);
  const spinnerColor =
    variant === 'default' || variant === 'destructive'
      ? theme.colors.onPrimary
      : theme.colors.primary;

  return (
    <Button
      variant={variant}
      disabled={isDisabled}
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      className={cn('h-11 min-h-11 rounded-full px-4', className)}
      style={style}
    >
      {loading ? (
        <ActivityIndicator size="small" color={spinnerColor} />
      ) : typeof children === 'string' || typeof children === 'number' ? (
        <Text
          style={{
            fontFamily: Fonts.sans.semibold,
            fontSize: 15,
            letterSpacing: -0.15,
            color:
              textColor ??
              (variant === 'default'
                ? theme.colors.onPrimary
                : variant === 'destructive'
                  ? theme.colors.onNeg
                  : theme.colors.fg),
          }}
          numberOfLines={1}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </Button>
  );
}
