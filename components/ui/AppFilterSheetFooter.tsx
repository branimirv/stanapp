import { Pressable, Text, View } from 'react-native';

type AppFilterSheetFooterProps = {
  clearLabel: string;
  doneLabel: string;
  onClear: () => void;
  onDone: () => void;
};

/** Clear + Done actions shared by expense/report filter sheets. */
export function AppFilterSheetFooter({
  clearLabel,
  doneLabel,
  onClear,
  onDone,
}: AppFilterSheetFooterProps) {
  return (
    <View className="flex-row gap-2.25">
      <Pressable
        onPress={onClear}
        accessibilityRole="button"
        accessibilityLabel={clearLabel}
        className="bg-surface-2 h-11 flex-1 flex-row items-center justify-center gap-1.5 rounded-full px-4"
      >
        <Text className="text-fg text-sm font-semibold tracking-[-0.14px]" numberOfLines={1}>
          {clearLabel}
        </Text>
      </Pressable>

      <Pressable
        onPress={onDone}
        accessibilityRole="button"
        accessibilityLabel={doneLabel}
        className="bg-primary h-11 flex-2 flex-row items-center justify-center gap-1.5 rounded-full px-4"
      >
        <Text className="text-on-primary text-sm font-semibold tracking-[-0.14px]">
          {doneLabel}
        </Text>
      </Pressable>
    </View>
  );
}
