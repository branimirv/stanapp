import { format } from 'date-fns';
import { enUS, hr } from 'date-fns/locale';
import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { Spacing, Typography } from '@/constants/theme';
import type { Language } from '@/types/app.types';

const dateLocales = { en: enUS, hr } as const;

export interface DashboardHeaderProps {
  name?: string | null;
  language?: Language;
}

function getGreetingKey(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'dashboard.greetingMorning';
  if (hour < 18) return 'dashboard.greetingAfternoon';
  return 'dashboard.greetingEvening';
}

export function DashboardHeader({ name, language = 'hr' }: DashboardHeaderProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const locale = dateLocales[language];

  const greeting = t(getGreetingKey(), { name: name ? `, ${name}` : '' });
  const dateLabel = format(new Date(), 'EEEE, d MMMM yyyy', { locale });

  return (
    <View style={styles.container}>
      <Text style={[styles.greeting, { color: theme.colors.onSurface }]}>{greeting}</Text>
      <Text style={[styles.date, { color: theme.colors.onSurfaceVariant }]}>{dateLabel}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
    gap: 2,
  },
  greeting: {
    ...Typography.headlineMedium,
  },
  date: {
    ...Typography.bodyMedium,
  },
});
