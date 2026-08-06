import { TextClassContext } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { Platform, Pressable } from 'react-native';

const buttonVariants = cva(
  cn(
    'group shrink-0 flex-row items-center justify-center gap-2 rounded-full shadow-none',
    Platform.select({
      web: "focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive whitespace-nowrap outline-none transition-all focus-visible:ring-[3px] disabled:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
    })
  ),
  {
    variants: {
      variant: {
        default: cn(
          'bg-primary active:bg-primary/90 shadow-sm shadow-black/5',
          Platform.select({ web: 'hover:bg-primary/90' })
        ),
        destructive: cn(
          'bg-neg active:bg-neg/90 shadow-sm shadow-black/5',
          Platform.select({
            web: 'hover:bg-neg/90 focus-visible:ring-neg/20',
          })
        ),
        outline: cn(
          'border-bd bg-surface-2 active:bg-surface-3 border shadow-none',
          Platform.select({
            web: 'hover:bg-surface-3',
          })
        ),
        secondary: cn(
          'bg-surface-2 active:bg-surface-3 shadow-none',
          Platform.select({ web: 'hover:bg-surface-3' })
        ),
        ghost: cn(
          'active:bg-surface-2',
          Platform.select({ web: 'hover:bg-surface-2' })
        ),
        link: '',
      },
      size: {
        default: cn('h-11 px-4 py-2', Platform.select({ web: 'has-[>svg]:px-3' })),
        sm: cn('h-9 gap-1.5 rounded-full px-3', Platform.select({ web: 'has-[>svg]:px-2.5' })),
        lg: cn('h-11 rounded-full px-6', Platform.select({ web: 'has-[>svg]:px-4' })),
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

const buttonTextVariants = cva(
  cn(
    'text-fg text-sm font-semibold',
    Platform.select({ web: 'pointer-events-none transition-colors' })
  ),
  {
    variants: {
      variant: {
        default: 'text-on-primary',
        destructive: 'text-on-neg',
        outline: 'text-fg',
        secondary: 'text-fg',
        ghost: 'text-fg',
        link: cn(
          'text-primary group-active:underline',
          Platform.select({ web: 'underline-offset-4 hover:underline group-hover:underline' })
        ),
      },
      size: {
        default: '',
        sm: '',
        lg: '',
        icon: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

type ButtonProps = React.ComponentProps<typeof Pressable> &
  React.RefAttributes<typeof Pressable> &
  VariantProps<typeof buttonVariants>;

function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <TextClassContext.Provider value={buttonTextVariants({ variant, size })}>
      <Pressable
        className={cn(props.disabled && 'opacity-50', buttonVariants({ variant, size }), className)}
        role="button"
        {...props}
      />
    </TextClassContext.Provider>
  );
}

export { Button, buttonTextVariants, buttonVariants };
export type { ButtonProps };
