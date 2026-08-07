import { StyleSheet, Text, View } from 'react-native';

import { cn } from '@/lib/utils';

type TenantContractRowProps = {
  label: string;
  value: string;
  isLast?: boolean;
};

/** Label/value row inside the tenant contract card. */
export function TenantContractRow({ label, value, isLast }: TenantContractRowProps) {
  return (
    <View
      className={cn(
        'flex-row items-center justify-between gap-3.25 py-3.25',
        !isLast && 'border-bd border-b',
      )}
      style={!isLast ? { borderBottomWidth: StyleSheet.hairlineWidth } : undefined}
    >
      <Text className="text-muted flex-1 text-[13px]">{label}</Text>
      <Text className="text-fg max-w-[55%] text-right text-[13px] font-semibold" numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}
