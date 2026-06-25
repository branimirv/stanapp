import { Search } from 'lucide-react-native';
import { Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'react-native-paper';

interface SearchHeaderButtonProps {
  active?: boolean;
  expanded?: boolean;
  onPress: () => void;
}

export function SearchHeaderButton({ active, expanded, onPress }: SearchHeaderButtonProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  const color = active || expanded ? theme.colors.primary : theme.colors.onSurface;

  return (
    <Pressable
      onPress={onPress}
      style={styles.button}
      accessibilityRole="button"
      accessibilityLabel={t('common.search')}
      accessibilityState={{ expanded: !!expanded }}
    >
      {({ pressed }) => (
        <Search size={22} color={color} strokeWidth={2} opacity={pressed ? 0.5 : 1} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 4,
  },
});
