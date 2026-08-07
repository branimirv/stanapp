import { THEMES } from '@/constants/config';
import { SettingsOptionSheet } from '@/components/ui/SettingsList';
import type { TabBarLabelMode } from '@/hooks/useTabBarPreference';
import type { Language, Theme } from '@/types/app.types';

export const ME_THEME_LABELS: Record<Theme, string> = {
  light: 'settings.themeLight',
  dark: 'settings.themeDark',
  system: 'settings.themeSystem',
};

export const ME_TAB_BAR_LABELS: Record<TabBarLabelMode, string> = {
  iconAndLabel: 'settings.tabBarIconAndLabel',
  iconOnly: 'settings.tabBarIconOnly',
};

type MePreferenceSheetsProps = {
  activePicker: 'language' | 'theme' | 'tabBar' | null;
  language: Language;
  themePreference: Theme;
  tabBarMode: TabBarLabelMode;
  languageTitle: string;
  themeTitle: string;
  tabBarTitle: string;
  languageEnglishLabel: string;
  languageCroatianLabel: string;
  themeOptionLabel: (theme: Theme) => string;
  tabBarIconAndLabel: string;
  tabBarIconOnlyLabel: string;
  onSelectLanguage: (language: Language) => void;
  onSelectTheme: (theme: Theme) => void;
  onSelectTabBar: (mode: TabBarLabelMode) => void;
  onClose: () => void;
};

/** Controlled preference pickers for the Me screen. */
export function MePreferenceSheets({
  activePicker,
  language,
  themePreference,
  tabBarMode,
  languageTitle,
  themeTitle,
  tabBarTitle,
  languageEnglishLabel,
  languageCroatianLabel,
  themeOptionLabel,
  tabBarIconAndLabel,
  tabBarIconOnlyLabel,
  onSelectLanguage,
  onSelectTheme,
  onSelectTabBar,
  onClose,
}: MePreferenceSheetsProps) {
  return (
    <>
      <SettingsOptionSheet<Language>
        visible={activePicker === 'language'}
        title={languageTitle}
        value={language}
        options={[
          { value: 'en', label: languageEnglishLabel },
          { value: 'hr', label: languageCroatianLabel },
        ]}
        onSelect={onSelectLanguage}
        onClose={onClose}
      />

      <SettingsOptionSheet<Theme>
        visible={activePicker === 'theme'}
        title={themeTitle}
        value={themePreference}
        options={THEMES.map((item) => ({
          value: item,
          label: themeOptionLabel(item),
        }))}
        onSelect={onSelectTheme}
        onClose={onClose}
      />

      <SettingsOptionSheet<TabBarLabelMode>
        visible={activePicker === 'tabBar'}
        title={tabBarTitle}
        value={tabBarMode}
        options={[
          { value: 'iconAndLabel', label: tabBarIconAndLabel },
          { value: 'iconOnly', label: tabBarIconOnlyLabel },
        ]}
        onSelect={onSelectTabBar}
        onClose={onClose}
      />
    </>
  );
}
