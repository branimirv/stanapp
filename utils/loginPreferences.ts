import AsyncStorage from '@react-native-async-storage/async-storage';

const LOGIN_PREFS_KEY = '@stanapp/login_prefs';

export interface LoginPreferences {
  rememberMe: boolean;
  email: string;
}

const DEFAULT_PREFERENCES: LoginPreferences = {
  rememberMe: true,
  email: '',
};

export async function loadLoginPreferences(): Promise<LoginPreferences> {
  try {
    const raw = await AsyncStorage.getItem(LOGIN_PREFS_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export async function saveLoginPreferences(preferences: LoginPreferences): Promise<void> {
  await AsyncStorage.setItem(LOGIN_PREFS_KEY, JSON.stringify(preferences));
}
