import { StyleSheet, View } from 'react-native';

import { SettingsHeaderButton } from '@/components/ui/SettingsHeaderButton';

interface StackHeaderActionsProps {
  children?: React.ReactNode;
}

export function StackHeaderActions({ children }: StackHeaderActionsProps) {
  return (
    <View style={styles.container}>
      {children}
      <SettingsHeaderButton style={styles.settings} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settings: {
    marginRight: 8,
  },
});
