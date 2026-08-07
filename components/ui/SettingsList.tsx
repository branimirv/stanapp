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
import { useAppTheme } from '@/hooks/useAppTheme';
import { displayFontFamily } from '@/lib/fonts';
import { cn } from '@/lib/utils';

interface SettingsGroupProps {
  title?: string;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

/** Naslov settings card: Fraunces sechead + surface card of `.lrow.stgrow` rows. */
export function SettingsGroup({ title, children, style, className }: SettingsGroupProps) {
  const { theme } = useAppTheme();
  const { elevation } = theme;
  const items = Children.toArray(children).filter((child) => isValidElement(child));

  return (
    <View className={cn('mb-5.5', className)} style={style}>
      {title ? (
        <Text
          className="text-fg mb-2.75 text-xl tracking-[-0.4px]"
          style={{
            fontFamily: displayFontFamily(theme.name),
            lineHeight: 24,
          }}
        >
          {title}
        </Text>
      ) : null}
      <View
        className="border-card-bd bg-surface overflow-hidden rounded-xl border px-4.5 pt-1 pb-1.5"
        style={[elevation.card, { borderWidth: StyleSheet.hairlineWidth }]}
      >
        {items.map((child, index) => (
          <View key={index}>
            {index > 0 ? (
              <View className="bg-bd ml-11" style={{ height: StyleSheet.hairlineWidth }} />
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

  const badgeClass =
    badgeTone === 'primary'
      ? 'bg-primary-tint'
      : badgeTone === 'accent'
        ? 'bg-pos-tint'
        : 'bg-surface-2';
  const badgeTextClass =
    badgeTone === 'primary'
      ? 'text-primary'
      : badgeTone === 'accent'
        ? 'text-pos'
        : 'text-muted';

  const content = (
    <View className="flex-row items-center gap-2.75 py-3.25">
      <View className="bg-surface-2 h-8.25 w-8.25 items-center justify-center rounded-full">
        <Icon
          size={15}
          color={destructive ? colors.neg : colors.muted}
          strokeWidth={2}
        />
      </View>

      <View className="min-w-0 flex-1">
        <Text
          className={cn(
            'text-[15px] font-medium tracking-[-0.15px]',
            destructive ? 'text-neg' : 'text-fg',
          )}
          numberOfLines={1}
        >
          {label}
        </Text>
        {subtitle ? (
          <Text className="text-muted mt-0.5 text-[12.5px] leading-4" numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {loading ? <ActivityIndicator size="small" color={colors.muted} /> : null}

      {!loading && badge ? (
        <View className={cn('rounded-full px-2.25 py-1', badgeClass)}>
          <Text
            className={cn('text-[11px] font-semibold tracking-[-0.05px]', badgeTextClass)}
            numberOfLines={1}
          >
            {badge}
          </Text>
        </View>
      ) : null}

      {!loading && value && !badge ? (
        <Text
          className="text-muted text-[11px] font-semibold tracking-[0.8px] uppercase"
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

  return (
    <AppBottomSheet visible={visible} onDismiss={onClose} title={title}>
      <View className="mb-3 gap-1">
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <Pressable
              key={option.value}
              onPress={() => {
                onSelect(option.value);
                onClose();
              }}
              className={cn(
                'min-h-12 justify-center rounded-md px-3.5',
                selected ? 'bg-primary-tint' : 'bg-transparent',
              )}
              accessibilityRole="button"
              accessibilityState={{ selected }}
            >
              <Text
                className={cn(
                  'text-[15px] tracking-[-0.15px]',
                  selected ? 'text-primary font-semibold' : 'text-fg font-medium',
                )}
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
        className="bg-surface-2 h-11 items-center justify-center rounded-full"
      >
        <Text className="text-fg text-sm font-semibold tracking-[-0.14px]">
          {t('common.cancel')}
        </Text>
      </Pressable>
    </AppBottomSheet>
  );
}
