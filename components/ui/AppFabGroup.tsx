import type { LucideIcon } from 'lucide-react-native';
import { Plus, X } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { FAB, Text, useTheme } from 'react-native-paper';
import { Spacing, Typography } from '@/constants/theme';

export type AppFabAction = {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
};

type AppFabGroupProps = {
  actions: AppFabAction[];
  style?: StyleProp<ViewStyle>;
  fabStyle?: StyleProp<ViewStyle>;
};

function renderLucideIcon(Icon: LucideIcon) {
  return ({ size, color }: { size: number; color: string }) => (
    <Icon size={size} color={color} strokeWidth={2} />
  );
}

function WebFabGroup({ actions, style, fabStyle }: AppFabGroupProps) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  const handleActionPress = useCallback(
    (onPress: () => void) => {
      onPress();
      close();
    },
    [close],
  );

  return (
    <View pointerEvents="box-none" style={[styles.container, style]}>
      {open ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close menu"
          onPress={close}
          style={[styles.backdrop, { backgroundColor: theme.colors.scrim }]}
        />
      ) : null}

      {open ? (
        <View pointerEvents="box-none" style={styles.actions}>
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Pressable
                key={action.label}
                accessibilityRole="button"
                accessibilityLabel={action.label}
                onPress={() => handleActionPress(action.onPress)}
                style={({ pressed }) => [styles.actionRow, pressed && styles.actionRowPressed]}
              >
                <View
                  style={[
                    styles.labelCard,
                    { backgroundColor: theme.colors.elevation.level2 },
                  ]}
                >
                  <Text style={[styles.label, { color: theme.colors.onSurface }]}>
                    {action.label}
                  </Text>
                </View>
                <View
                  style={[
                    styles.actionFab,
                    { backgroundColor: theme.colors.secondaryContainer },
                  ]}
                >
                  <Icon size={24} color={theme.colors.onSecondaryContainer} strokeWidth={2} />
                </View>
              </Pressable>
            );
          })}
        </View>
      ) : null}

      <FAB
        icon={renderLucideIcon(open ? X : Plus)}
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen((value) => !value)}
        style={[styles.fab, fabStyle]}
      />
    </View>
  );
}

function NativeFabGroup({ actions, style, fabStyle }: AppFabGroupProps) {
  const [open, setOpen] = useState(false);

  return (
    <FAB.Group
      open={open}
      visible
      icon={renderLucideIcon(open ? X : Plus)}
      actions={actions.map((action) => ({
        icon: renderLucideIcon(action.icon),
        label: action.label,
        onPress: action.onPress,
      }))}
      onStateChange={({ open: nextOpen }) => setOpen(nextOpen)}
      style={style}
      fabStyle={fabStyle}
    />
  );
}

export function AppFabGroup(props: AppFabGroupProps) {
  if (Platform.OS === 'web') {
    return <WebFabGroup {...props} />;
  }

  return <NativeFabGroup {...props} />;
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  actions: {
    alignItems: 'flex-end',
    gap: Spacing.md,
    marginBottom: Spacing.md,
    paddingRight: Spacing.md,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  actionRowPressed: {
    opacity: 0.85,
  },
  labelCard: {
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    elevation: 2,
  },
  label: {
    ...Typography.titleMedium,
  },
  actionFab: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  fab: {
    marginRight: Spacing.md,
  },
});
