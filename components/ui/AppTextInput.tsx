import { forwardRef, type ComponentRef, type ReactElement } from 'react';
import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form';
import {
  Platform,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { Input } from '@/components/ui/input';
import { Typography } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Fonts } from '@/lib/fonts';
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
      left,
      right,
      mode: _mode,
      dense: _dense,
      multiline,
      ...rest
    },
    ref,
  ) {
    const { theme } = useAppTheme();
    const hasError = Boolean(error);
    const hasLeft = Boolean(left);
    const hasRight = Boolean(right);
    const isMultiline = Boolean(multiline);

    return (
      <View className="mb-4.5 w-full" style={containerStyle}>
        {label ? (
          <Text
            className="text-fg mb-2 text-[13px] leading-gutter font-semibold"
            style={{ fontFamily: Fonts.sans.semibold }}
          >
            {label}
          </Text>
        ) : null}
        <View className="relative w-full">
          {hasLeft ? (
            <View
              pointerEvents="none"
              className={cn(
                'absolute left-3.5 z-10 justify-center',
                isMultiline ? 'top-3' : 'inset-y-0',
              )}
            >
              {left}
            </View>
          ) : null}
          <Input
            ref={ref}
            multiline={multiline}
            className={cn(
              'bg-surface-2 border-bd text-fg w-full rounded-md border px-3.5 shadow-none',
              isMultiline
                ? 'h-auto min-h-21 py-3'
                : 'h-12 min-h-12 py-0',
              hasLeft && 'pl-11',
              hasRight && 'pr-11',
              hasError && 'border-neg',
              className,
            )}
            style={[
              {
                fontFamily: Fonts.sans.regular,
                fontSize: Typography.text.input.size,
                ...(isMultiline
                  ? {
                      paddingTop: 12,
                      paddingBottom: 12,
                      ...(Platform.OS === 'android'
                        ? { textAlignVertical: 'top' as const }
                        : null),
                    }
                  : {
                      // lineHeight on iOS TextInput shifts glyphs below center vs adornments
                      paddingVertical: 0,
                      ...(Platform.OS === 'android'
                        ? { textAlignVertical: 'center' as const }
                        : null),
                    }),
              },
              style,
            ]}
            placeholderClassName="text-muted"
            placeholderTextColor={theme.colors.muted}
            aria-invalid={hasError}
            {...rest}
          />
          {hasRight ? (
            <View className="absolute inset-y-0 right-1 z-10 w-8.5 items-center justify-center">
              {right}
            </View>
          ) : null}
        </View>
        {hasError ? (
          <Text
            className="text-neg mt-1.5 text-sm leading-4.5"
            style={{ fontFamily: Fonts.sans.regular }}
          >
            {error}
          </Text>
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
