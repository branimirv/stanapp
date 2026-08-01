import { forwardRef, type ComponentRef, type ReactElement } from 'react';
import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form';
import {
  TextInput,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

type BaseAppTextInputProps = Omit<
  React.ComponentProps<typeof TextInput>,
  'style' | 'onChange' | 'value'
> & {
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
  label?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  style?: StyleProp<TextStyle>;
  className?: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
  mode?: 'outlined' | 'flat';
  dense?: boolean;
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
      label,
      className,
      style,
      left: _left,
      right: _right,
      mode: _mode,
      dense: _dense,
      ...rest
    },
    ref,
  ) {
    const hasError = Boolean(error);

    return (
      <View className="w-full gap-1.5" style={containerStyle}>
        {label ? <Text className="text-muted-foreground text-sm font-medium">{label}</Text> : null}
        <Input
          ref={ref}
          className={cn('min-h-11 rounded-xl', hasError && 'border-destructive', className)}
          style={style}
          aria-invalid={hasError}
          {...rest}
        />
        {hasError ? <Text className="text-destructive text-sm">{error}</Text> : null}
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
