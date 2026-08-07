import { Children, type ReactNode } from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';

import { GlassSurface } from '@/components/ui/GlassSurface';
import { HEADER_ACTION_SLOT } from '@/constants/header';
import { useAppTheme } from '@/hooks/useAppTheme';
import { cn } from '@/lib/utils';

interface HeaderActionsPillProps {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

const btnIcoSize = {
  width: HEADER_ACTION_SLOT,
  height: HEADER_ACTION_SLOT,
} as const;

const btnIcoContent = {
  flex: 1,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
};

/**
 * Row of Naslov `btn-ico` circles (docs, edit, etc.).
 * Children should be icon presses (e.g. HeaderIconButton) — each sits on liquid glass.
 */
export function HeaderActionsPill({ children, style, className }: HeaderActionsPillProps) {
  const actions = Children.toArray(children).filter(Boolean);
  if (actions.length === 0) {
    return null;
  }

  return (
    <View className={cn('flex-row items-center gap-2', className)} style={style}>
      {actions.map((child, index) => (
        <GlassSurface
          key={index}
          shape="circle"
          interactive
          style={btnIcoSize}
          contentStyle={btnIcoContent}
        >
          {child}
        </GlassSurface>
      ))}
    </View>
  );
}

/** Standalone Naslov btn-ico for one-off header / floating nav actions. */
export function HeaderBtnIco({
  children,
  onPress,
  accessibilityLabel,
  style,
  active = false,
  disabled = false,
}: {
  children: ReactNode;
  onPress: () => void;
  accessibilityLabel: string;
  style?: StyleProp<ViewStyle>;
  /** Filter / search “on” state — primary tint over glass. */
  active?: boolean;
  disabled?: boolean;
}) {
  const { theme } = useAppTheme();

  return (
    <GlassSurface
      shape="circle"
      interactive={!disabled}
      style={[btnIcoSize, disabled ? { opacity: 0.45 } : null, style]}
      contentStyle={[
        btnIcoContent,
        active ? { backgroundColor: theme.colors.primaryTint } : null,
      ]}
    >
      <Pressable
        onPress={onPress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ selected: active, disabled }}
        className="w-full flex-1 items-center justify-center"
        hitSlop={4}
      >
        {children}
      </Pressable>
    </GlassSurface>
  );
}
