import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { createClient, type SupportedStorage } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';
import { LargeSecureStore } from '@/lib/secureAuthStorage';

const noopStorage: SupportedStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

function createAuthStorage(): SupportedStorage {
  // SSR / static export — no window, no session to persist.
  if (Platform.OS === 'web' && typeof window === 'undefined') {
    return noopStorage;
  }

  // SecureStore is native-only; web keeps AsyncStorage (localStorage).
  if (Platform.OS === 'web') {
    return AsyncStorage;
  }

  return new LargeSecureStore();
}

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in .env',
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: createAuthStorage(),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
