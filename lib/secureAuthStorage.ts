import 'react-native-get-random-values';

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SupportedStorage } from '@supabase/supabase-js';
import * as aesjs from 'aes-js';
import * as SecureStore from 'expo-secure-store';

const SECURE_STORE_OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED,
};

/**
 * Expo SecureStore rejects values over ~2048 bytes on some platforms.
 * Store an AES-256 key in SecureStore and keep the ciphertext in AsyncStorage.
 * @see https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native
 */
export class LargeSecureStore implements SupportedStorage {
  async getItem(key: string): Promise<string | null> {
    const stored = await AsyncStorage.getItem(key);
    if (stored == null) {
      return null;
    }

    const encryptionKeyHex = await SecureStore.getItemAsync(
      toSecureStoreKey(key),
      SECURE_STORE_OPTIONS,
    );

    if (!encryptionKeyHex) {
      // Pre-SecureStore plaintext session — migrate in place.
      await this.setItem(key, stored);
      return stored;
    }

    try {
      return decrypt(encryptionKeyHex, stored);
    } catch {
      // Corrupt ciphertext or leftover plaintext after a partial upgrade.
      if (looksLikePlaintextSession(stored)) {
        await this.setItem(key, stored);
        return stored;
      }
      await this.removeItem(key);
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    const encrypted = await encryptAndPersistKey(key, value);
    await AsyncStorage.setItem(key, encrypted);
  }

  async removeItem(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
    try {
      await SecureStore.deleteItemAsync(toSecureStoreKey(key), SECURE_STORE_OPTIONS);
    } catch {
      // Key may already be absent.
    }
  }
}

/** SecureStore only allows alphanumeric characters plus `.`, `-`, and `_`. */
export function toSecureStoreKey(key: string): string {
  return key.replace(/[^a-zA-Z0-9._-]/g, '_');
}

export function looksLikePlaintextSession(value: string): boolean {
  const trimmed = value.trim();
  return trimmed.startsWith('{') || trimmed.startsWith('"');
}

async function encryptAndPersistKey(key: string, value: string): Promise<string> {
  const encryptionKey = crypto.getRandomValues(new Uint8Array(256 / 8));
  const cipher = new aesjs.ModeOfOperation.ctr(encryptionKey, new aesjs.Counter(1));
  const encryptedBytes = cipher.encrypt(aesjs.utils.utf8.toBytes(value));

  await SecureStore.setItemAsync(
    toSecureStoreKey(key),
    aesjs.utils.hex.fromBytes(encryptionKey),
    SECURE_STORE_OPTIONS,
  );

  return aesjs.utils.hex.fromBytes(encryptedBytes);
}

function decrypt(encryptionKeyHex: string, encryptedHex: string): string {
  const cipher = new aesjs.ModeOfOperation.ctr(
    aesjs.utils.hex.toBytes(encryptionKeyHex),
    new aesjs.Counter(1),
  );
  const decryptedBytes = cipher.decrypt(aesjs.utils.hex.toBytes(encryptedHex));
  return aesjs.utils.utf8.fromBytes(decryptedBytes);
}
