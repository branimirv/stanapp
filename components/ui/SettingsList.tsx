import type { LucideIcon } from 'lucide-react-native';
import { ChevronRight } from 'lucide-react-native';
import { Children, isValidElement, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppBottomSheet } from '@/components/ui/AppBottomSheet';
import { Typography } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { displayFontFamily, Fonts } from '@/lib/fonts';

interface SettingsGroupProps {
  title?: string;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

/** Naslov settings card: Fraunces sechead + surface card of `.lrow.stgrow` rows. */
export function SettingsGroup({ title, children, style }: SettingsGroupProps) {
  const { theme } = useAppTheme();
  const { colors, elevation, radius } = theme;
  const items = Children.toArray(children).filter((child) => isValidElement(child));

  return (
    <View style={[styles.group, style]}>
      {title ? (
        <Text
          style={{
            fontFamily: displayFontFamily(theme.name),
            fontSize: 20,
            lineHeight: 24,
            letterSpacing: -0.4,
            color: colors.fg,
            marginBottom: 11,
          }}
        >
          {title}
        </Text>
      ) : null}
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.cardBd,
            borderRadius: radius.xl,
            ...elevation.card,
          },
        ]}
      >
        {items.map((child, index) => (
          <View key={index}>
            {index > 0 ? (
              <View style={[styles.divider, { backgroundColor: colors.bd }]} />
            ) : null}
            {child}
          </View>
        ))}
      </View>
    </View>
  );
}

interface SettingsRowProps {
  icon: LucideIcon;
  label: string;
  subtitle?: string;
  value?: string;
  badge?: string;
  badgeTone?: 'accent' | 'muted' | 'primary';
  showChevron?: boolean;
  trailing?: ReactNode;
  loading?: boolean;
  destructive?: boolean;
  disabled?: boolean;
  onPress?: () => void;
}

export function SettingsRow({
  icon: Icon,
  label,
  subtitle,
  value,
  badge,
  badgeTone = 'accent',
  showChevron,
  trailing,
  loading = false,
  destructive = false,
  disabled = false,
  onPress,
}: SettingsRowProps) {
  const { theme } = useAppTheme();
  const { colors } = theme;
  const chevronVisible = showChevron ?? Boolean(onPress);
  const isInteractive = Boolean(onPress) && !disabled && !loading;

  const badgeBg =
    badgeTone === 'primary'
      ? colors.primaryTint
      : badgeTone === 'accent'
        ? colors.posTint
        : colors.surface2;
  const badgeFg =
    badgeTone === 'primary'
      ? colors.primary
      : badgeTone === 'accent'
        ? colors.pos
        : colors.muted;

  const content = (
    <View style={styles.row}>
      <View style={[styles.iconWell, { backgroundColor: colors.surface2 }]}>
        <Icon
          size={15}
          color={destructive ? colors.neg : colors.muted}
          strokeWidth={2}
        />
      </View>

      <View style={styles.rowBody}>
        <Text
          style={{
            fontFamily: Fonts.sans.medium,
            fontSize: Typography.text.settingsRow.size,
            letterSpacing: -0.15,
            color: destructive ? colors.neg : colors.fg,
          }}
          numberOfLines={1}
        >
          {label}
        </Text>
        {subtitle ? (
          <Text
            style={{
              fontFamily: Fonts.sans.regular,
              fontSize: Typography.text.caption.size,
              lineHeight: 16,
              color: colors.muted,
              marginTop: 2,
            }}
            numberOfLines={2}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>

      {loading ? <ActivityIndicator size="small" color={colors.muted} /> : null}

      {!loading && badge ? (
        <View style={[styles.chip, { backgroundColor: badgeBg }]}>
          <Text
            style={{
              fontFamily: Fonts.sans.semibold,
              fontSize: Typography.text.chipSm.size,
              letterSpacing: -0.05,
              color: badgeFg,
            }}
            numberOfLines={1}
          >
            {badge}
          </Text>
        </View>
      ) : null}

      {!loading && value && !badge ? (
        <Text
          style={{
            fontFamily: Fonts.sans.semibold,
            fontSize: Typography.text.chipSm.size,
            letterSpacing: 0.8,
            textTransform: 'uppercase',
            color: colors.muted,
          }}
          numberOfLines={1}
        >
          {value}
        </Text>
      ) : null}

      {!loading && trailing ? trailing : null}

      {!loading && chevronVisible ? (
        <ChevronRight size={16} color={colors.muted} strokeWidth={2} />
      ) : null}
    </View>
  );

  if (!isInteractive) {
    return content;
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => ({ opacity: pressed ? 0.72 : 1 })}
    >
      {content}
    </Pressable>
  );
}

export interface SettingsOption<T extends string = string> {
  value: T;
  label: string;
}

interface SettingsOptionSheetProps<T extends string = string> {
  visible: boolean;
  title: string;
  options: SettingsOption<T>[];
  value: T | null;
  onSelect: (value: T) => void;
  onClose: () => void;
}

/** Naslov option sheet — host must render BlurOverlay as a sibling (see docs/blur). */
export function SettingsOptionSheet<T extends string = string>({
  visible,
  title,
  options,
  value,
  onSelect,
  onClose,
}: SettingsOptionSheetProps<T>) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const { colors } = theme;

  return (
    <AppBottomSheet visible={visible} onDismiss={onClose} title={title}>
      <View style={styles.optionList}>
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <Pressable
              key={option.value}
              onPress={() => {
                onSelect(option.value);
                onClose();
              }}
              style={[
                styles.optionRow,
                {
                  backgroundColor: selected ? colors.primaryTint : 'transparent',
                },
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected }}
            >
              <Text
                style={{
                  fontFamily: selected ? Fonts.sans.semibold : Fonts.sans.medium,
                  fontSize: 15,
                  letterSpacing: -0.15,
                  color: selected ? colors.primary : colors.fg,
                }}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Pressable
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel={t('common.cancel')}
        style={[styles.cancelBtn, { backgroundColor: colors.surface2 }]}
      >
        <Text
          style={{
            fontFamily: Fonts.sans.semibold,
            fontSize: 14,
            letterSpacing: -0.14,
            color: colors.fg,
          }}
        >
          {t('common.cancel')}
        </Text>
      </Pressable>
    </AppBottomSheet>
  );
}

const styles = StyleSheet.create({
  group: {
    marginBottom: 22,
  },
  card: {
    paddingHorizontal: 18,
    paddingTop: 4,
    paddingBottom: 6,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 44,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingVertical: 13,
  },
  iconWell: {
    width: 33,
    height: 33,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBody: {
    flex: 1,
    minWidth: 0,
  },
  chip: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
  },
  optionList: {
    gap: 4,
    marginBottom: 12,
  },
  optionRow: {
    minHeight: 48,
    borderRadius: 14,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  cancelBtn: {
    height: 44,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
