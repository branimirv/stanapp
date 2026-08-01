import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { Spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useProperties } from '@/hooks/useProperties';

const TAB_LINKS: { title: string; href: string }[] = [
  { title: 'Dashboard', href: '/(tabs)/(dashboard)' },
  { title: 'Properties (tab)', href: '/(tabs)/properties' },
  { title: 'Expenses (tab)', href: '/(tabs)/expenses' },
  { title: 'Reports (tab)', href: '/(tabs)/reports' },
  { title: 'Me (tab)', href: '/(tabs)/me' },
];

function NavListSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text variant="small" className="text-muted-foreground uppercase" style={styles.sectionTitle}>
        {title}
      </Text>
      {children}
    </View>
  );
}

function NavListItem({
  title,
  description,
  onPress,
}: {
  title: string;
  description?: string;
  onPress: () => void;
}) {
  const { theme } = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.item,
        { borderColor: theme.colors.outline, opacity: pressed ? 0.6 : 1 },
      ]}
    >
      <Text>{title}</Text>
      {description ? (
        <Text variant="muted" style={styles.itemDescription}>
          {description}
        </Text>
      ) : null}
    </Pressable>
  );
}

export default function NavAuditScreen() {
  const { properties } = useProperties();

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text variant="muted" style={styles.hint}>
        Dev-only: jump to routes for navigation chrome screenshots.
      </Text>
      <NavListSection title="Tab roots">
        {TAB_LINKS.map((link) => (
          <NavListItem
            key={link.href}
            title={link.title}
            onPress={() => router.push(link.href as never)}
          />
        ))}
      </NavListSection>
      {properties.length > 0 ? (
        <NavListSection title="Entity push (property)">
          {properties.slice(0, 5).map((property) => (
            <NavListItem
              key={property.id}
              title={property.name}
              description={property.id}
              onPress={() => router.push(`/property/${property.id}`)}
            />
          ))}
        </NavListSection>
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
  section: {
    gap: Spacing.xs,
  },
  sectionTitle: {
    marginBottom: Spacing.xs,
  },
  item: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  itemDescription: {
    marginTop: 2,
  },
});
