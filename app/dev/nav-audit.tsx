import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { StackScreenChrome } from '@/components/ui/StackScreenChrome';
import { Text } from '@/components/ui/text';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useProperties } from '@/hooks/useProperties';
import { routes } from '@/lib/routes';

const TAB_LINKS: { title: string; href: string }[] = [
  { title: 'Dashboard', href: routes.tabs.dashboard },
  { title: 'Properties (tab)', href: routes.tabs.properties },
  { title: 'Expenses (tab)', href: routes.tabs.expenses },
  { title: 'Reports (tab)', href: routes.tabs.reports },
  { title: 'Me (tab)', href: routes.tabs.me.index },
];

function NavListSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="gap-1">
      <Text variant="small" className="text-muted-foreground mb-1 uppercase">
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
      className="border-bd px-1 py-2"
      style={({ pressed }) => [
        {
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderColor: theme.colors.outline,
          opacity: pressed ? 0.6 : 1,
        },
      ]}
    >
      <Text>{title}</Text>
      {description ? (
        <Text variant="muted" className="mt-0.5">
          {description}
        </Text>
      ) : null}
    </Pressable>
  );
}

export default function NavAuditScreen() {
  const { properties } = useProperties();

  return (
    <StackScreenChrome title="Nav audit">
      <ScrollView contentContainerClassName="gap-2 p-4">
        <Text variant="muted" className="mb-2">
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
                onPress={() => router.push(routes.property.detail(property.id))}
              />
            ))}
          </NavListSection>
        ) : null}
      </ScrollView>
    </StackScreenChrome>
  );
}
