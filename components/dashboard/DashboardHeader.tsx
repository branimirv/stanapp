import { format } from 'date-fns';
import { enUS, hr } from 'date-fns/locale';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Text } from '@/components/ui/text';
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
  const { t } = useTranslation();
  const locale = dateLocales[language];

  const greeting = t(getGreetingKey(), { name: name ? `, ${name}` : '' });
  const dateLabel = format(new Date(), 'EEEE, d MMMM yyyy', { locale });

  return (
    <View className="mb-4 gap-0.5">
      <Text className="text-xl font-semibold">{greeting}</Text>
      <Text className="text-muted-foreground text-sm">{dateLabel}</Text>
    </View>
  );
}
