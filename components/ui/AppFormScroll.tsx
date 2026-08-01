import type { ReactNode } from 'react';
import { ScrollView, View, type StyleProp, type ViewStyle } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

interface AppFormScrollProps {
  children: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  className?: string;
}

export function AppFormScroll({ children, contentStyle, className }: AppFormScrollProps) {
  return (
    <ScrollView
      className={cn('bg-background flex-1', className)}
      contentContainerClassName="gap-4 p-4 pb-12"
      contentContainerStyle={contentStyle}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
}

interface AppFormSectionProps {
  label: string;
  children: ReactNode;
}

export function AppFormSection({ label, children }: AppFormSectionProps) {
  return (
    <View className="gap-2">
      <Text className="text-sm font-medium">{label}</Text>
      {children}
    </View>
  );
}

interface AppFormSubmitProps {
  label: string;
  loading?: boolean;
  onPress: () => void;
}

export function AppFormSubmit({ label, loading = false, onPress }: AppFormSubmitProps) {
  return (
    <AppButton mode="contained" loading={loading} onPress={onPress} className="mt-2">
      {label}
    </AppButton>
  );
}
