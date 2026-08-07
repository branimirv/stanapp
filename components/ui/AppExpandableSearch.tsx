import { Search, X } from 'lucide-react-native';
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  Platform,
  Pressable,
  TextInput,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { cn } from '@/lib/utils';

const INPUT_HEIGHT = 48;
const DEBOUNCE_MS = 250;
const ICON_SLOT = 40;

/** Platform-precise TextInput geometry — keep as style. */
const nativeInputStyle: TextStyle = {
  lineHeight: Platform.OS === 'ios' ? undefined : 20,
  paddingLeft: ICON_SLOT,
  paddingRight: ICON_SLOT,
  paddingTop: 0,
  paddingBottom: 0,
  margin: 0,
  ...Platform.select<TextStyle>({
    ios: {
      height: INPUT_HEIGHT,
    },
    android: {
      height: INPUT_HEIGHT,
      textAlignVertical: 'center',
      includeFontPadding: false,
    },
    default: {
      height: INPUT_HEIGHT,
    },
  }),
};

export interface AppExpandableSearchHandle {
  isEmpty: () => boolean;
  clear: () => void;
}

export interface AppExpandableSearchProps {
  onChangeText: (value: string) => void;
  onActiveChange?: (hasText: boolean) => void;
  placeholder: string;
  style?: StyleProp<ViewStyle>;
  className?: string;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  hideTrigger?: boolean;
}

export const AppExpandableSearch = forwardRef<
  AppExpandableSearchHandle,
  AppExpandableSearchProps
>(function AppExpandableSearch(
  {
    onChangeText,
    onActiveChange,
    placeholder,
    style,
    className,
    expanded = false,
    onExpandedChange,
    hideTrigger = false,
  },
  ref,
) {
  const { theme } = useAppTheme();
  const { colors } = theme;
  const inputRef = useRef<TextInput>(null);
  const didAutoFocus = useRef(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textRef = useRef('');
  const [text, setText] = useState('');
  const [hasText, setHasText] = useState(false);
  const [focused, setFocused] = useState(false);

  const iconColor = colors.muted;

  const syncHasText = useCallback(
    (next: string) => {
      const nextHasText = next.trim().length > 0;
      setHasText(nextHasText);
      onActiveChange?.(nextHasText);
    },
    [onActiveChange],
  );

  const flushChange = useCallback(
    (next: string) => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
        debounceTimer.current = null;
      }
      textRef.current = next;
      onChangeText(next);
    },
    [onChangeText],
  );

  const collapse = useCallback(() => {
    onExpandedChange?.(false);
    inputRef.current?.blur();
  }, [onExpandedChange]);

  const clear = useCallback(() => {
    setText('');
    textRef.current = '';
    syncHasText('');
    flushChange('');
    collapse();
  }, [collapse, flushChange, syncHasText]);

  useImperativeHandle(
    ref,
    () => ({
      isEmpty: () => textRef.current.trim().length === 0,
      clear,
    }),
    [clear],
  );

  const handleChange = useCallback(
    (next: string) => {
      setText(next);
      textRef.current = next;
      syncHasText(next);

      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      debounceTimer.current = setTimeout(() => {
        onChangeText(next);
        debounceTimer.current = null;
      }, DEBOUNCE_MS);
    },
    [onChangeText, syncHasText],
  );

  const handleBlur = useCallback(() => {
    flushChange(textRef.current);
    if (!textRef.current.trim()) {
      collapse();
    }
  }, [collapse, flushChange]);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!hideTrigger || !expanded) {
      didAutoFocus.current = false;
      return;
    }

    if (!didAutoFocus.current) {
      didAutoFocus.current = true;
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [expanded, hideTrigger]);

  if (hideTrigger && !expanded) {
    return null;
  }

  return (
    <View className={cn('w-full min-h-12', className)} style={style}>
      <View
        className={cn(
          'bg-surface h-12 flex-row items-center rounded-sm border',
          focused ? 'border-primary' : 'border-bd',
        )}
      >
        <View className="absolute left-3 z-1 h-4.5 w-4.5 items-center justify-center" pointerEvents="none">
          <Search size={18} color={iconColor} strokeWidth={2} />
        </View>

        <TextInput
          ref={inputRef}
          value={text}
          onChangeText={handleChange}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            handleBlur();
          }}
          autoCorrect={false}
          autoComplete="off"
          spellCheck={false}
          placeholderTextColor={iconColor}
          selectionColor={colors.primary}
          cursorColor={colors.primary}
          className="text-fg flex-1 text-base"
          style={nativeInputStyle}
        />

        <Pressable
          onPress={hasText ? clear : undefined}
          disabled={!hasText}
          className="absolute right-3 z-1 h-4.5 w-4.5 items-center justify-center"
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Clear search"
        >
          <X size={18} color={hasText ? iconColor : 'transparent'} strokeWidth={2} />
        </Pressable>
      </View>
    </View>
  );
});
