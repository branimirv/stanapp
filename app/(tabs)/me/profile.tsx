import AsyncStorage from '@react-native-async-storage/async-storage';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import type { TFunction } from 'i18next';
import { Mail, Pencil } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Controller, useForm, type UseFormReturn } from 'react-hook-form';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { APP_BOTTOM_SHEET_CLOSE_MS } from '@/components/ui/AppBottomSheet';
import { AppPicker } from '@/components/ui/AppPicker';
import { AppTextInput } from '@/components/ui/AppTextInput';
import { BlurOverlay } from '@/components/ui/BlurOverlay';
import { ErrorState } from '@/components/ui/ErrorState';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { StackScreenChrome, useStackChromeEdgeInset } from '@/components/ui/StackScreenChrome';
import { SUPPORTED_CURRENCIES } from '@/constants/config';
import { Spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useProfile } from '@/hooks/useProfile';
import i18n from '@/i18n';
import { displayFontFamily, Fonts } from '@/lib/fonts';
import { useAuthStore } from '@/stores/authStore';
import { useUiStore } from '@/stores/uiStore';
import { getInitialsFromFullName } from '@/utils/avatar';
import { translateFieldError } from '@/utils/formHelpers';
import { profileSchema, type ProfileFormValues } from '@/utils/validators';

export default function ProfileSettingsScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  const { colors } = theme;
  const showToast = useUiStore((s) => s.showToast);
  const user = useAuthStore((s) => s.user);
  const { profile, isLoading, error, refetch, updateProfile } = useProfile();
  const [isSaving, setIsSaving] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema as never),
    values: profile
      ? {
          full_name: profile.full_name,
          default_currency: profile.default_currency as ProfileFormValues['default_currency'],
          language: profile.language,
          theme: profile.theme,
        }
      : undefined,
  });

  const initials = useMemo(
    () => getInitialsFromFullName(profile?.full_name ?? ''),
    [profile?.full_name],
  );

  const handleSubmit = form.handleSubmit(async (values) => {
    setIsSaving(true);
    try {
      await updateProfile(values);
      if (values.language !== i18n.language) {
        await i18n.changeLanguage(values.language);
        await AsyncStorage.setItem('@stanapp/language', values.language);
      }
      showToast({ message: t('settings.saveSuccess'), type: 'success' });
      router.back();
    } catch (err) {
      showToast({
        message: err instanceof Error ? err.message : t('settings.saveFailed'),
        type: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  });

  if (isLoading) {
    return (
      <StackScreenChrome title={t('settings.editProfile')} hideHeaderTitle edgeToEdge>
        <SkeletonLoader count={5} style={styles.loader} />
      </StackScreenChrome>
    );
  }

  if (error || !profile) {
    return (
      <StackScreenChrome title={t('settings.editProfile')} hideHeaderTitle edgeToEdge>
        <ErrorState message={error ?? t('settings.loadFailed')} onRetry={refetch} />
      </StackScreenChrome>
    );
  }

  return (
    <StackScreenChrome title={t('settings.editProfile')} hideHeaderTitle edgeToEdge>
      <ProfileEditBody
        form={form}
        email={user?.email ?? ''}
        initials={initials}
        isSaving={isSaving}
        onSubmit={handleSubmit}
        onSheetVisibilityChange={setSheetOpen}
        colors={colors}
        themeName={theme.name}
        footerPad={insets.bottom}
        t={t}
      />
      <BlurOverlay
        visible={sheetOpen}
        intensity="strong"
        tint="dark"
        duration={APP_BOTTOM_SHEET_CLOSE_MS}
        zIndex={5}
      />
    </StackScreenChrome>
  );
}

function ProfileEditBody({
  form,
  email,
  initials,
  isSaving,
  onSubmit,
  onSheetVisibilityChange,
  colors,
  themeName,
  footerPad,
  t,
}: {
  form: UseFormReturn<ProfileFormValues>;
  email: string;
  initials: string;
  isSaving: boolean;
  onSubmit: () => void;
  onSheetVisibilityChange: (open: boolean) => void;
  colors: ReturnType<typeof useAppTheme>['theme']['colors'];
  themeName: 'dark' | 'light';
  footerPad: number;
  t: TFunction;
}) {
  const edgeInset = useStackChromeEdgeInset() ?? 0;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="bg-transparent"
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={{
          paddingHorizontal: Spacing.gutter,
          paddingTop: edgeInset + Spacing.sm,
          paddingBottom: 100 + footerPad,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={{
            fontFamily: displayFontFamily(themeName),
            fontSize: 32,
            lineHeight: 32,
            letterSpacing: -0.8,
            color: colors.fg,
            marginBottom: 26,
          }}
        >
          {t('settings.editProfile')}
        </Text>

        <View style={styles.avatarWrap}>
          <View style={[styles.avatar, { backgroundColor: colors.primaryTint }]}>
            <Text
              style={{
                fontFamily: displayFontFamily(themeName),
                fontSize: 26,
                color: colors.primary,
              }}
            >
              {initials}
            </Text>
          </View>
          <View
            style={[
              styles.avatarEdit,
              {
                backgroundColor: colors.surface3,
                borderColor: colors.bg,
              },
            ]}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          >
            <Pencil size={14} color={colors.fg} strokeWidth={2} />
          </View>
        </View>

        <AppTextInput
          control={form.control}
          name="full_name"
          label={t('settings.displayName')}
          error={translateFieldError(t, form.formState.errors.full_name?.message)}
        />

        <AppTextInput
          label={t('settings.email')}
          value={email}
          editable={false}
          left={<Mail size={18} color={colors.primary} strokeWidth={2} />}
        />

        <Controller
          control={form.control}
          name="default_currency"
          render={({ field: { value, onChange }, fieldState }) => (
            <AppPicker
              label={t('settings.currency')}
              options={SUPPORTED_CURRENCIES.map((currency) => ({
                value: currency,
                label: currency,
              }))}
              value={value}
              onValueChange={onChange}
              error={translateFieldError(t, fieldState.error?.message)}
              onVisibilityChange={onSheetVisibilityChange}
            />
          )}
        />
      </ScrollView>

      <View
        style={[
          styles.formFoot,
          {
            paddingBottom: Math.max(footerPad, 12) + 8,
            backgroundColor: colors.bg,
            borderTopColor: colors.bd,
          },
        ]}
      >
        <Pressable
          onPress={onSubmit}
          disabled={isSaving}
          accessibilityRole="button"
          accessibilityLabel={t('settings.saveChanges')}
          style={[
            styles.saveBtn,
            { backgroundColor: colors.primary, opacity: isSaving ? 0.7 : 1 },
          ]}
        >
          <Text
            style={{
              fontFamily: Fonts.sans.semibold,
              fontSize: 15,
              letterSpacing: -0.15,
              color: colors.onPrimary,
            }}
          >
            {t('settings.saveChanges')}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  loader: {
    padding: Spacing.md,
  },
  avatarWrap: {
    alignSelf: 'center',
    width: 76,
    height: 76,
    marginBottom: 26,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEdit: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    width: 30,
    height: 30,
    borderRadius: 999,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formFoot: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: Spacing.gutter,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  saveBtn: {
    height: 50,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
