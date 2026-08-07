import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { cn } from '@/lib/utils';

type FormFieldProps = {
  label?: string;
  error?: string;
  children: ReactNode;
  className?: string;
};

/**
 * Shared form field chrome: optional label, control slot, error line.
 * Prefer this over repeating label/error wrappers in feature forms.
 */
export function FormField({ label, error, children, className }: FormFieldProps) {
  return (
    <View className={cn('mb-4', className)}>
      {label ? (
        <Text className="text-fg mb-1.5 text-[13px] font-semibold tracking-[-0.13px]">
          {label}
        </Text>
      ) : null}
      {children}
      {error ? <Text className="text-neg mt-1.5 text-xs">{error}</Text> : null}
    </View>
  );
}
