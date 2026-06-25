import { AlertTriangle } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { Colors, Spacing, Typography } from '@/constants/theme';

export interface OverdueAlertProps {
  count: number;
  onPress?: () => void;
}

export function OverdueAlert({ count, onPress }: OverdueAlertProps) {
  const theme = useTheme();
  const { t } = useTranslation();

  if (count <= 0) {
    return null;
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={[
        styles.container,
        {
          backgroundColor: theme.dark ? '#7F1D1D' : '#FEF2F2',
          borderColor: Colors.danger,
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={t('dashboard.overdueAlert')}
    >
      <View style={styles.iconWrap}>
        <AlertTriangle size={22} color={Colors.danger} strokeWidth={2} />
      </View>

      <View style={styles.content}>
        <Text style={[styles.title, { color: Colors.danger }]}>
          {t('dashboard.overdueCount', { count })}
        </Text>
        <Text style={[styles.message, { color: theme.dark ? '#FECACA' : '#991B1B' }]}>
          {t('dashboard.overdueAlert')}
        </Text>
      </View>

      {onPress ? (
        <Text style={[styles.action, { color: Colors.danger }]}>{t('dashboard.viewOverdue')}</Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${Colors.danger}22`,
  },
  content: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...Typography.titleMedium,
  },
  message: {
    ...Typography.bodySmall,
  },
  action: {
    ...Typography.labelLarge,
  },
});
