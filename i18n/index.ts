import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import en from './locales/en.json';
import hr from './locales/hr.json';

const deviceLanguage = Localization.getLocales()[0]?.languageCode ?? 'hr';

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, hr: { translation: hr } },
  lng: deviceLanguage === 'en' ? 'en' : 'hr',
  fallbackLng: 'hr',
  interpolation: { escapeValue: false },
});

export default i18n;
