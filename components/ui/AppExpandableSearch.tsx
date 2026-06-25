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
  StyleSheet,
  TextInput,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useTheme } from 'react-native-paper';

const INPUT_HEIGHT = 48;
const DEBOUNCE_MS = 250;
const HORIZONTAL_PADDING = 12;
const ICON_SLOT = 40;

export interface AppExpandableSearchHandle {
  isEmpty: () => boolean;
  clear: () => void;
}

export interface AppExpandableSearchProps {
  onChangeText: (value: string) => void;
  onActiveChange?: (hasText: boolean) => void;
  placeholder: string;
  style?: StyleProp<ViewStyle>;
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
    expanded = false,
    onExpandedChange,
    hideTrigger = false,
  },
  ref,
) {
  const theme = useTheme();
  const inputRef = useRef<TextInput>(null);
  const didAutoFocus = useRef(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textRef = useRef('');
  const [text, setText] = useState('');
  const [hasText, setHasText] = useState(false);
  const [focused, setFocused] = useState(false);

  const inputBackground = theme.colors.background;
  const iconColor = theme.colors.onSurfaceVariant;
  const borderColor = focused ? theme.colors.primary : theme.colors.outline;

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
    <View style={[styles.row, style]}>
      <View
        style={[
          styles.field,
          {
            borderColor,
            backgroundColor: inputBackground,
          },
        ]}
      >
        <View style={styles.leadingIcon} pointerEvents="none">
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
          placeholderTextColor={theme.colors.onSurfaceVariant}
          selectionColor={theme.colors.primary}
          cursorColor={theme.colors.primary}
          style={[styles.nativeInput, { color: theme.colors.onSurface }]}
        />

        <Pressable
          onPress={hasText ? clear : undefined}
          disabled={!hasText}
          style={styles.trailingIcon}
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

const styles = StyleSheet.create({
  row: {
    width: '100%',
    minHeight: INPUT_HEIGHT,
  },
  field: {
    height: INPUT_HEIGHT,
    borderWidth: 1,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  leadingIcon: {
    position: 'absolute',
    left: HORIZONTAL_PADDING,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  trailingIcon: {
    position: 'absolute',
    right: HORIZONTAL_PADDING,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  nativeInput: {
    flex: 1,
    fontSize: 16,
    lineHeight: Platform.OS === 'ios' ? undefined : 20,
    paddingLeft: ICON_SLOT,
    paddingRight: ICON_SLOT,
    paddingTop: 0,
    paddingBottom: 0,
    margin: 0,
    ...Platform.select({
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
  },
});
