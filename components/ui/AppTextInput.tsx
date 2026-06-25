import { forwardRef, type ComponentRef, type ReactElement } from 'react';
import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import {
  HelperText,
  TextInput,
  useTheme,
  type TextInputProps,
} from 'react-native-paper';

type BaseAppTextInputProps = Omit<TextInputProps, 'error'> & {
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
};

export type AppTextInputProps<TFieldValues extends FieldValues = FieldValues> =
  BaseAppTextInputProps & {
    control?: Control<TFieldValues>;
    name?: FieldPath<TFieldValues>;
  };

const AppTextInputInner = forwardRef<ComponentRef<typeof TextInput>, BaseAppTextInputProps>(
  function AppTextInputInner(
    {
      error,
      containerStyle,
      mode = 'outlined',
      style,
      ...rest
    },
    ref,
  ) {
    const theme = useTheme();
    const hasError = Boolean(error);
    const inputBackground = theme.colors.background;

    return (
      <View style={[styles.container, containerStyle]}>
        <TextInput
          ref={ref as never}
          mode={mode}
          error={hasError}
          textColor={theme.colors.onSurface}
          outlineColor={theme.colors.outline}
          activeOutlineColor={theme.colors.primary}
          placeholderTextColor={theme.colors.onSurfaceVariant}
          selectionColor={theme.colors.primary}
          cursorColor={theme.colors.primary}
          style={[styles.input, { backgroundColor: inputBackground }, style]}
          {...rest}
        />
        {hasError ? (
          <HelperText type="error" visible={hasError}>
            {error}
          </HelperText>
        ) : null}
      </View>
    );
  },
);

function AppTextInputWithControl<TFieldValues extends FieldValues>({
  control,
  name,
  ...rest
}: AppTextInputProps<TFieldValues> & {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value, ref }, fieldState }) => (
        <AppTextInputInner
          ref={ref}
          value={value ?? ''}
          onChangeText={onChange}
          onBlur={onBlur}
          error={fieldState.error?.message}
          {...rest}
        />
      )}
    />
  );
}

export const AppTextInput = forwardRef(function AppTextInput<
  TFieldValues extends FieldValues = FieldValues,
>(props: AppTextInputProps<TFieldValues>, ref: React.Ref<ComponentRef<typeof TextInput>>) {
  if (props.control && props.name) {
    return <AppTextInputWithControl {...props} control={props.control} name={props.name} />;
  }

  const { control: _control, name: _name, ...rest } = props;
  return <AppTextInputInner ref={ref} {...rest} />;
}) as <TFieldValues extends FieldValues = FieldValues>(
  props: AppTextInputProps<TFieldValues> & {
    ref?: React.Ref<ComponentRef<typeof TextInput>>;
  },
) => ReactElement | null;

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  input: {
    backgroundColor: 'transparent',
  },
});
