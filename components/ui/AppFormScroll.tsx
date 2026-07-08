import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

import { AppButton } from '@/components/ui/AppButton';
import { Spacing, Typography } from '@/constants/theme';

interface AppFormScrollProps {
  children: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
}

export function AppFormScroll({ children, contentStyle }: AppFormScrollProps) {
  const theme = useTheme();

  return (
    <ScrollView
      style={{ backgroundColor: theme.colors.background }}
      contentContainerStyle={[styles.scrollContent, contentStyle]}
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
  const theme = useTheme();

  return (
    <View style={styles.section}>
      <Text style={[styles.label, { color: theme.colors.onSurface }]}>{label}</Text>
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
    <AppButton mode="contained" loading={loading} onPress={onPress} style={styles.submit}>
      {label}
    </AppButton>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: Spacing.md,
    gap: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  section: {
    gap: Spacing.sm,
  },
  label: {
    ...Typography.labelLarge,
  },
  submit: {
    marginTop: Spacing.sm,
  },
});
