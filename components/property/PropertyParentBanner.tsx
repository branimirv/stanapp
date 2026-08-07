import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Text } from '@/components/ui/text';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Fonts } from '@/lib/fonts';
import { routes } from '@/lib/routes';
import type { Property } from '@/types/app.types';

export function PropertyParentBanner({ parent }: { parent: Property }) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const { colors } = theme;

  return (
    <View style={styles.parentWrap}>
      <Pressable
        onPress={() => router.push(routes.property.detail(parent.id))}
        accessibilityRole="link"
        accessibilityLabel={t('properties.linkedTo', { name: parent.name })}
        style={[
          styles.parentBanner,
          { backgroundColor: colors.surface2, borderRadius: 999 },
        ]}
      >
        <Text
          style={{
            fontFamily: Fonts.sans.medium,
            fontSize: 13,
            color: colors.primary,
            textAlign: 'center',
          }}
          numberOfLines={1}
        >
          {t('properties.linkedTo', { name: parent.name })}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  parentWrap: {
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  parentBanner: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
