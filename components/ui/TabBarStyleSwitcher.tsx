import { Pressable, StyleSheet, View } from 'react-native';
import { RadioButton, Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import { Spacing } from '@/constants/theme';
import { useTabBarPreference, type TabBarLabelMode } from '@/hooks/useTabBarPreference';

const OPTIONS: Array<{ value: TabBarLabelMode; labelKey: string }> = [
  { value: 'iconAndLabel', labelKey: 'settings.tabBarIconAndLabel' },
  { value: 'iconOnly', labelKey: 'settings.tabBarIconOnly' },
];

interface TabBarStyleSwitcherProps {
  onPersist?: (mode: TabBarLabelMode) => void;
}

export function TabBarStyleSwitcher({ onPersist }: TabBarStyleSwitcherProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { labelMode, setLabelMode } = useTabBarPreference();

  const handleChange = async (mode: string) => {
    const next = mode as TabBarLabelMode;
    await setLabelMode(next);
    onPersist?.(next);
  };

  return (
    <RadioButton.Group onValueChange={handleChange} value={labelMode}>
      <View style={styles.group}>
        {OPTIONS.map((option) => {
          const selected = labelMode === option.value;

          return (
            <Pressable
              key={option.value}
              onPress={() => handleChange(option.value)}
              style={styles.row}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
            >
              <RadioButton
                value={option.value}
                status={selected ? 'checked' : 'unchecked'}
                onPress={() => handleChange(option.value)}
                color={theme.colors.primary}
              />
              <Text style={[styles.label, { color: theme.colors.onSurface }]}>
                {t(option.labelKey)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </RadioButton.Group>
  );
}

const styles = StyleSheet.create({
  group: {
    gap: Spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    gap: Spacing.xs,
  },
  label: {
    flex: 1,
  },
});
