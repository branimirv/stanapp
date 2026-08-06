import { cn } from '@/lib/utils';
import { Platform, TextInput } from 'react-native';

function Input({
  className,
  placeholderClassName: _placeholderClassName,
  multiline,
  ...props
}: React.ComponentProps<typeof TextInput> &
  React.RefAttributes<TextInput> & {
    placeholderClassName?: string;
  }) {
  return (
    <TextInput
      multiline={multiline}
      className={cn(
        'bg-surface-2 border-bd text-fg w-full min-w-0 rounded-[14px] border px-3.5 shadow-none',
        multiline
          ? 'h-auto min-h-21 py-3'
          : 'h-[46px] flex-row items-center py-0',
        props.editable === false &&
          cn(
            'opacity-50',
            Platform.select({ web: 'disabled:pointer-events-none disabled:cursor-not-allowed' }),
          ),
        Platform.select({
          web: cn(
            'placeholder:text-muted selection:bg-primary selection:text-on-primary outline-none transition-[color,box-shadow]',
            'focus-visible:border-primary focus-visible:ring-primary/30 focus-visible:ring-[3px]',
            'aria-invalid:ring-neg/20 aria-invalid:border-neg',
          ),
          native: 'placeholder:text-muted',
        }),
        className,
      )}
      {...props}
    />
  );
}

export { Input };
