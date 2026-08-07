import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { displayFontFamily } from '@/lib/fonts';

export type MeStatBay = {
  label: string;
  value: number;
};

type MeProfileHeaderProps = {
  firstName: string;
  restName: string | null;
  email?: string | null;
  initials: string;
  bays: readonly MeStatBay[];
};

/** Profile hero: stacked display name, email, avatar initials, and stat bays. */
export function MeProfileHeader({
  firstName,
  restName,
  email,
  initials,
  bays,
}: MeProfileHeaderProps) {
  const { theme } = useAppTheme();
  const { elevation } = theme;

  return (
    <>
      <View className="mb-5">
        <View className="flex-row items-start gap-3.5">
          <View className="min-w-0 flex-1">
            <Text
              className="text-fg text-[32px] tracking-[-0.8px]"
              style={{
                fontFamily: displayFontFamily(theme.name),
                lineHeight: 34.5,
              }}
            >
              {firstName}
              {restName ? `\n${restName}` : ''}
            </Text>
            {email ? (
              <Text className="text-muted mt-2.5 text-[12.5px]" numberOfLines={1}>
                {email}
              </Text>
            ) : null}
          </View>
          <View className="bg-primary-tint h-14.5 w-14.5 items-center justify-center rounded-full">
            <Text
              className="text-primary text-[21px]"
              style={{ fontFamily: displayFontFamily(theme.name) }}
            >
              {initials}
            </Text>
          </View>
        </View>
      </View>

      <View
        className="border-card-bd bg-surface mb-5.5 flex-row overflow-hidden rounded-xl border"
        style={[{ borderWidth: StyleSheet.hairlineWidth }, elevation.card]}
      >
        {bays.map((bay, index) => (
          <View key={bay.label} className="flex-1 flex-row">
            {index > 0 ? (
              <View className="bg-bd" style={{ width: StyleSheet.hairlineWidth }} />
            ) : null}
            <View className="flex-1 px-3.5 py-4">
              <Text className="text-muted mb-2.25 text-[10px] font-semibold tracking-[0.8px] uppercase">
                {bay.label}
              </Text>
              <Text
                className="text-fg text-[21px] tracking-[-0.42px]"
                style={{ fontFamily: displayFontFamily(theme.name) }}
              >
                {bay.value}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </>
  );
}
