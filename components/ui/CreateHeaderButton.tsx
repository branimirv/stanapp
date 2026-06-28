import { Plus } from 'lucide-react-native';
import { Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'react-native-paper';

interface CreateHeaderButtonProps {
  onPress: () => void;
}

export function CreateHeaderButton({ onPress }: CreateHeaderButtonProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={styles.button}
      accessibilityRole="button"
      accessibilityLabel={t('properties.addNew')}
    >
      {({ pressed }) => (
        <Plus
          size={22}
          color={theme.colors.primary}
          strokeWidth={2}
          opacity={pressed ? 0.5 : 1}
        />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 4,
  },
});
