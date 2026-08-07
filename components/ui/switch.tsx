import * as SwitchPrimitives from '@rn-primitives/switch';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';

const TRACK_W = 51;
const TRACK_H = 31;
const THUMB = 27;
const PAD = 2;
const THUMB_TRAVEL = TRACK_W - THUMB - PAD * 2;

export type SwitchProps = React.ComponentProps<typeof SwitchPrimitives.Root> & {
  style?: StyleProp<ViewStyle>;
};

/**
 * Naslov toggle — primary track + white thumb (always visible).
 * Avoids Uniwind token mismatches that made the thumb disappear on dark.
 */
function Switch({ className: _className, style, disabled, checked, ...props }: SwitchProps) {
  const { theme } = useAppTheme();
  const { colors } = theme;
  const on = Boolean(checked);

  return (
    <SwitchPrimitives.Root
      checked={checked}
      disabled={disabled}
      style={[
        {
          width: TRACK_W,
          height: TRACK_H,
          borderRadius: TRACK_H / 2,
          padding: PAD,
          borderWidth: StyleSheet.hairlineWidth,
          justifyContent: 'center',
          backgroundColor: on ? colors.primary : colors.track,
          opacity: disabled ? 0.5 : 1,
          borderColor: on ? colors.primary : colors.bd,
        },
        style,
      ]}
      {...props}
    >
      <SwitchPrimitives.Thumb
        style={{
          width: THUMB,
          height: THUMB,
          borderRadius: THUMB / 2,
          backgroundColor: '#FFFFFF',
          shadowColor: '#000',
          shadowOpacity: 0.18,
          shadowRadius: 2.5,
          shadowOffset: { width: 0, height: 1 },
          elevation: 2,
          transform: [{ translateX: on ? THUMB_TRAVEL : 0 }],
        }}
      />
    </SwitchPrimitives.Root>
  );
}

export { Switch };
