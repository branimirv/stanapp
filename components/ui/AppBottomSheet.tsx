import { X } from 'lucide-react-native';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Animated,
  Easing,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { HeaderBtnIco } from '@/components/ui/HeaderActionsPill';
import { useAppTheme } from '@/hooks/useAppTheme';
import { displayFontFamily } from '@/lib/fonts';

export interface AppBottomSheetProps {
  visible: boolean;
  onDismiss: () => void;
  title: string;
  children: ReactNode;
  /** When true, children sit in a ScrollView (max ~70% height). */
  scrollable?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
}

/** Keep BlurOverlay `duration` in sync with this close animation. */
export const APP_BOTTOM_SHEET_CLOSE_MS = 320;

/** @deprecated Use APP_BOTTOM_SHEET_CLOSE_MS */
export const QUICK_CREATE_CLOSE_MS = APP_BOTTOM_SHEET_CLOSE_MS;

const SLIDE_DISTANCE = 110;
const OPEN_EASE = Easing.bezier(0.32, 0.72, 0, 1);
const CLOSE_EASE = Easing.bezier(0.4, 0, 0.68, 0.06);

/**
 * Naslov bottom sheet — transparent Modal chrome only.
 * Blur must be a sibling on the screen (never inside this Modal). See docs/blur.
 * Outside taps use a flex:1 hit target above the sheet.
 */
export function AppBottomSheet({
  visible,
  onDismiss,
  title,
  children,
  scrollable = false,
  contentStyle,
}: AppBottomSheetProps) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const { colors } = theme;
  const insets = useSafeAreaInsets();
  const slide = useRef(new Animated.Value(SLIDE_DISTANCE)).current;
  const sheetOpacity = useRef(new Animated.Value(0)).current;
  const [modalVisible, setModalVisible] = useState(false);
  const closingRef = useRef(false);
  const hasPresentedRef = useRef(false);

  useEffect(() => {
    if (visible) {
      closingRef.current = false;
      hasPresentedRef.current = true;
      setModalVisible(true);
      slide.setValue(SLIDE_DISTANCE);
      sheetOpacity.setValue(0);
      Animated.parallel([
        Animated.timing(slide, {
          toValue: 0,
          duration: 380,
          easing: OPEN_EASE,
          useNativeDriver: true,
        }),
        Animated.timing(sheetOpacity, {
          toValue: 1,
          duration: 240,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
      return;
    }

    if (!hasPresentedRef.current) return;

    Animated.parallel([
      Animated.timing(slide, {
        toValue: SLIDE_DISTANCE,
        duration: APP_BOTTOM_SHEET_CLOSE_MS,
        easing: CLOSE_EASE,
        useNativeDriver: true,
      }),
      Animated.timing(sheetOpacity, {
        toValue: 0,
        duration: APP_BOTTOM_SHEET_CLOSE_MS - 40,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        setModalVisible(false);
        hasPresentedRef.current = false;
      }
    });
  }, [visible, slide, sheetOpacity]);

  const requestClose = useCallback(() => {
    if (!visible || closingRef.current) return;
    closingRef.current = true;
    onDismiss();
  }, [visible, onDismiss]);

  const body = scrollable ? (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={contentStyle}
      bounces={false}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={contentStyle}>{children}</View>
  );

  return (
    <Modal
      visible={modalVisible}
      transparent
      statusBarTranslucent
      animationType="none"
      onRequestClose={requestClose}
      {...(Platform.OS === 'android' ? { backdropColor: 'transparent' as const } : null)}
    >
      <View style={styles.modalRoot}>
        <Pressable
          style={styles.dismissHit}
          onPress={requestClose}
          accessibilityRole="button"
          accessibilityLabel={t('common.close')}
        />

        <Animated.View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.surface,
              paddingBottom: Math.max(insets.bottom, 20) + 12,
              ...theme.elevation.sheet,
              opacity: sheetOpacity,
              transform: [{ translateY: slide }],
            },
          ]}
        >
          <View style={[styles.handle, { backgroundColor: colors.bdStrong }]} />

          <View style={styles.header}>
            <Text
              style={{
                fontFamily: displayFontFamily(theme.name),
                fontSize: 28,
                lineHeight: 32,
                letterSpacing: -0.56,
                color: colors.fg,
                flex: 1,
              }}
            >
              {title}
            </Text>
            <HeaderBtnIco
              onPress={requestClose}
              accessibilityLabel={t('common.close')}
            >
              <X size={17} color={colors.fg} strokeWidth={2} />
            </HeaderBtnIco>
          </View>

          {body}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  dismissHit: {
    flex: 1,
  },
  sheet: {
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingTop: 10,
    paddingHorizontal: 18,
    maxHeight: '85%',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 999,
    alignSelf: 'center',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  scroll: {
    flexGrow: 0,
  },
});
