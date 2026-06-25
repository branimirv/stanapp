import { ActivityIndicator, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { Button, useTheme, type ButtonProps } from 'react-native-paper';

export interface AppButtonProps extends Omit<ButtonProps, 'loading'> {
  loading?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
}

export function AppButton({
  loading = false,
  disabled,
  children,
  mode = 'contained',
  containerStyle,
  style,
  ...rest
}: AppButtonProps) {
  const theme = useTheme();
  const isDisabled = disabled || loading;

  return (
    <Button
      mode={mode}
      disabled={isDisabled}
      style={[styles.button, style]}
      contentStyle={[styles.content, containerStyle]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={mode === 'contained' ? theme.colors.onPrimary : theme.colors.primary}
        />
      ) : (
        children
      )}
    </Button>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
  },
  content: {
    minHeight: 44,
  },
});
