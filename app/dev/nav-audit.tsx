import { router } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';
import { List, Text } from 'react-native-paper';

import { Spacing } from '@/constants/theme';
import { useProperties } from '@/hooks/useProperties';

const TAB_LINKS: { title: string; href: string }[] = [
  { title: 'Dashboard', href: '/(tabs)' },
  { title: 'Properties (tab)', href: '/(tabs)/properties' },
  { title: 'Expenses (tab)', href: '/(tabs)/expenses' },
  { title: 'Reports (tab)', href: '/(tabs)/reports' },
  { title: 'Settings', href: '/settings' },
];

export default function NavAuditScreen() {
  const { properties } = useProperties();

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text variant="bodyMedium" style={styles.hint}>
        Dev-only: jump to routes for navigation chrome screenshots.
      </Text>
      <List.Section title="Tab roots">
        {TAB_LINKS.map((link) => (
          <List.Item
            key={link.href}
            title={link.title}
            onPress={() => router.push(link.href as never)}
          />
        ))}
      </List.Section>
      {properties.length > 0 ? (
        <List.Section title="Entity push (property)">
          {properties.slice(0, 5).map((property) => (
            <List.Item
              key={property.id}
              title={property.name}
              description={property.id}
              onPress={() => router.push(`/property/${property.id}`)}
            />
          ))}
        </List.Section>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  hint: {
    marginBottom: Spacing.sm,
  },
});
