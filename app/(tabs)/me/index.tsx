import { router, Stack } from 'expo-router';
import { Bell } from 'lucide-react-native';
import { Linking, Platform, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  MePreferenceSheets,
  ME_TAB_BAR_LABELS,
  ME_THEME_LABELS,
} from '@/components/me/MePreferenceSheets';
import { MeProfileHeader } from '@/components/me/MeProfileHeader';
import { MeSettingsContent } from '@/components/me/MeSettingsContent';
import { APP_BOTTOM_SHEET_CLOSE_MS } from '@/components/ui/AppBottomSheet';
import { BlurOverlay } from '@/components/ui/BlurOverlay';
import { ErrorState } from '@/components/ui/ErrorState';
import { FloatingScreenActions } from '@/components/ui/FloatingScreenActions';
import { HeaderBtnIco } from '@/components/ui/HeaderActionsPill';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { HEADER_ACTION_SLOT, HEADER_ICON_SIZE, tabRootScreenOptions } from '@/constants/header';
import { Spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useMeScreen } from '@/hooks/useMeScreen';
import { routes } from '@/lib/routes';

export default function MeScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  const { colors } = theme;
  const me = useMeScreen();

  if (me.isLoading) {
    return (
      <>
        <Stack.Screen options={tabRootScreenOptions(me.t('tabs.me'))} />
        <SkeletonLoader count={8} className="p-4" />
      </>
    );
  }

  if (me.error) {
    return (
      <>
        <Stack.Screen options={tabRootScreenOptions(me.t('tabs.me'))} />
        <ErrorState message={me.error} onRetry={me.refetchProfile} />
      </>
    );
  }

  return (
    <View className="flex-1 bg-transparent" collapsable={false}>
      <Stack.Screen options={tabRootScreenOptions(me.t('settings.profile'))} />

      <ScrollView
        className="flex-1"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: theme.spacing.gutter,
          paddingTop: Platform.OS === 'ios' ? Spacing.sm : insets.top + Spacing.sm,
          paddingBottom: Spacing.scrollBottom,
        }}
        refreshControl={
          <RefreshControl refreshing={me.refreshing} onRefresh={me.onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View
          className="flex-row items-center justify-between py-4"
          style={{ minHeight: HEADER_ACTION_SLOT + 32 }}
        >
          <Text className="text-muted flex-1 text-[11px] leading-3.5 font-semibold tracking-[1.54px] uppercase">
            {me.t('settings.profile')}
          </Text>
          <View style={{ width: HEADER_ACTION_SLOT, height: HEADER_ACTION_SLOT }} />
        </View>

        <MeProfileHeader
          firstName={me.nameParts.first}
          restName={me.nameParts.rest}
          email={me.userEmail}
          initials={me.initials}
          bays={me.statBays}
        />

        <MeSettingsContent
          ownsAnyProperty={me.ownsAnyProperty}
          appearanceValue={me.t(ME_THEME_LABELS[me.preference])}
          languageValue={me.languageLabel}
          notificationsBadge={me.notificationsBadge}
          notificationsEnabled={me.notificationsEnabledCount > 0}
          tabBarValue={me.t(ME_TAB_BAR_LABELS[me.labelMode])}
          isExporting={me.isExporting}
          versionLabel={me.versionLabel}
          onEditProfile={() => router.push(routes.tabs.me.profile)}
          onOpenTeam={() => router.push(routes.tabs.me.team)}
          onOpenAppearance={() => me.openPicker('theme')}
          onOpenLanguage={() => me.openPicker('language')}
          onOpenNotifications={() => router.push(routes.tabs.me.notifications)}
          onOpenTabBar={() => me.openPicker('tabBar')}
          onExport={me.handleExport}
          onOpenPrivacy={() => Linking.openURL('https://stanapp.app/privacy')}
          onSignOut={me.handleSignOut}
        />
      </ScrollView>

      <FloatingScreenActions align="right">
        <HeaderBtnIco
          onPress={() => router.push(routes.tabs.me.notifications)}
          accessibilityLabel={me.t('settings.notifications')}
        >
          <Bell size={HEADER_ICON_SIZE} color={colors.fg} strokeWidth={2} />
        </HeaderBtnIco>
      </FloatingScreenActions>

      <BlurOverlay
        visible={me.pickerOpen}
        intensity="strong"
        tint="dark"
        duration={APP_BOTTOM_SHEET_CLOSE_MS}
        zIndex={5}
      />

      <MePreferenceSheets
        activePicker={me.activePicker}
        language={me.language}
        themePreference={me.preference}
        tabBarMode={me.labelMode}
        languageTitle={me.t('settings.language')}
        themeTitle={me.t('settings.appearance')}
        tabBarTitle={me.t('settings.tabBarStyle')}
        languageEnglishLabel={me.t('settings.languageEnglish')}
        languageCroatianLabel={me.t('settings.languageCroatian')}
        themeOptionLabel={(item) => me.t(ME_THEME_LABELS[item])}
        tabBarIconAndLabel={me.t('settings.tabBarIconAndLabel')}
        tabBarIconOnlyLabel={me.t('settings.tabBarIconOnly')}
        onSelectLanguage={me.handleLanguageChange}
        onSelectTheme={me.handleThemeChange}
        onSelectTabBar={me.handleTabBarChange}
        onClose={me.closePicker}
      />
    </View>
  );
}
