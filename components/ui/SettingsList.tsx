import type { LucideIcon } from 'lucide-react-native';
import { ChevronRight } from 'lucide-react-native';
import { Children, isValidElement, type ReactNode } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppButton } from '@/components/ui/AppButton';
import { Icon } from '@/components/ui/icon';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

interface SettingsGroupProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

export function SettingsGroup({ title, children, className }: SettingsGroupProps) {
  const items = Children.toArray(children).filter((child) => isValidElement(child));

  return (
    <View className={cn('gap-2', className)}>
      {title ? (
        <Text className="text-muted-foreground px-1 text-[11px] font-semibold uppercase tracking-wider">
          {title}
        </Text>
      ) : null}
      <View className="bg-card overflow-hidden rounded-3xl shadow-sm shadow-black/5">
        {items.map((child, index) => (
          <View key={index}>
            {child}
            {index < items.length - 1 ? <View className="bg-border ml-13 h-px" /> : null}
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
  badgeTone?: 'accent' | 'muted';
  showChevron?: boolean;
  trailing?: ReactNode;
  loading?: boolean;
  destructive?: boolean;
  disabled?: boolean;
  onPress?: () => void;
}

export function SettingsRow({
  icon,
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
  const chevronVisible = showChevron ?? Boolean(onPress);
  const isInteractive = Boolean(onPress) && !disabled && !loading;

  const content = (
    <View className="min-h-14 flex-row items-center gap-3 px-4 py-3.5">
      <View className="h-6 w-6 items-center justify-center">
        <Icon
          as={icon}
          size={20}
          className={destructive ? 'text-destructive' : 'text-muted-foreground'}
          strokeWidth={1.75}
        />
      </View>

      <View className="min-w-0 flex-1 gap-0.5">
        <Text
          className={cn(
            'text-[15px] font-semibold',
            destructive ? 'text-destructive' : 'text-foreground',
          )}
          numberOfLines={1}
        >
          {label}
        </Text>
        {subtitle ? (
          <Text className="text-muted-foreground text-xs" numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {loading ? <ActivityIndicator size="small" /> : null}

      {!loading && badge ? (
        <View
          className={cn(
            'rounded-full px-2.5 py-1',
            badgeTone === 'accent' ? 'bg-success/15' : 'bg-secondary',
          )}
        >
          <Text
            className={cn(
              'text-[11px] font-bold uppercase tracking-wide',
              badgeTone === 'accent' ? 'text-success' : 'text-muted-foreground',
            )}
          >
            {badge}
          </Text>
        </View>
      ) : null}

      {!loading && value && !badge ? (
        <Text className="text-muted-foreground text-sm" numberOfLines={1}>
          {value}
        </Text>
      ) : null}

      {!loading && trailing ? trailing : null}

      {!loading && chevronVisible ? (
        <Icon as={ChevronRight} size={18} className="text-muted-foreground/60" strokeWidth={2} />
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
      className="active:bg-muted/60"
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
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable className="flex-1 justify-end bg-black/45" onPress={onClose}>
        <Pressable
          className="bg-card max-h-[70%] rounded-t-[20px] px-6 pb-8 pt-6"
          onPress={(event) => event.stopPropagation()}
        >
          <Text className="mb-3 text-center text-lg font-semibold">{title}</Text>
          <ScrollView>
            {options.map((option, index) => {
              const selected = option.value === value;
              return (
                <View key={option.value}>
                  <Pressable
                    onPress={() => {
                      onSelect(option.value);
                      onClose();
                    }}
                    className={cn(
                      'rounded-xl px-3 py-3.5',
                      selected && 'bg-accent',
                    )}
                  >
                    <Text
                      className={cn(
                        'text-base',
                        selected ? 'text-accent-foreground font-semibold' : 'text-foreground',
                      )}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                  {index < options.length - 1 ? <Separator className="my-0.5" /> : null}
                </View>
              );
            })}
          </ScrollView>
          <AppButton mode="text" onPress={onClose} className="mt-2">
            {t('common.cancel')}
          </AppButton>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
