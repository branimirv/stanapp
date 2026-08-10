import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

import {
  LargeSecureStore,
  looksLikePlaintextSession,
  toSecureStoreKey,
} from '@/lib/secureAuthStorage';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock('expo-secure-store', () => ({
  WHEN_UNLOCKED: 'WHEN_UNLOCKED',
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock('expo-crypto', () => ({
  getRandomValues: jest.fn((array: Uint8Array) => {
    for (let i = 0; i < array.length; i += 1) {
      array[i] = (i * 17) % 256;
    }
    return array;
  }),
}));

const asyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
const secureStore = SecureStore as jest.Mocked<typeof SecureStore>;

describe('toSecureStoreKey', () => {
  it('replaces characters SecureStore rejects', () => {
    expect(toSecureStoreKey('sb-abc/auth-token')).toBe('sb-abc_auth-token');
  });

  it('keeps allowed characters', () => {
    expect(toSecureStoreKey('sb-project-ref-auth-token')).toBe('sb-project-ref-auth-token');
  });
});

describe('looksLikePlaintextSession', () => {
  it('detects JSON objects and strings', () => {
    expect(looksLikePlaintextSession('{"access_token":"x"}')).toBe(true);
    expect(looksLikePlaintextSession('"token"')).toBe(true);
    expect(looksLikePlaintextSession('deadbeef')).toBe(false);
  });
});

describe('LargeSecureStore', () => {
  const store = new LargeSecureStore();
  const key = 'sb-test-auth-token';
  const secureKey = toSecureStoreKey(key);
  const sessionJson = JSON.stringify({
    access_token: 'access',
    refresh_token: 'refresh',
    user: { id: 'user-1' },
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('encrypts on setItem and round-trips through getItem', async () => {
    let asyncValue: string | null = null;
    let secureValue: string | null = null;

    asyncStorage.setItem.mockImplementation(async (_k, value) => {
      asyncValue = value;
    });
    asyncStorage.getItem.mockImplementation(async () => asyncValue);
    secureStore.setItemAsync.mockImplementation(async (_k, value) => {
      secureValue = value;
    });
    secureStore.getItemAsync.mockImplementation(async () => secureValue);

    await store.setItem(key, sessionJson);

    expect(secureStore.setItemAsync).toHaveBeenCalledWith(
      secureKey,
      expect.any(String),
      expect.objectContaining({ keychainAccessible: SecureStore.WHEN_UNLOCKED }),
    );
    expect(asyncValue).not.toBe(sessionJson);
    expect(asyncValue).toMatch(/^[0-9a-f]+$/);

    const result = await store.getItem(key);
    expect(result).toBe(sessionJson);
  });

  it('migrates legacy plaintext AsyncStorage sessions', async () => {
    let asyncValue: string | null = sessionJson;
    let secureValue: string | null = null;

    asyncStorage.getItem.mockImplementation(async () => asyncValue);
    asyncStorage.setItem.mockImplementation(async (_k, value) => {
      asyncValue = value;
    });
    secureStore.getItemAsync.mockImplementation(async () => secureValue);
    secureStore.setItemAsync.mockImplementation(async (_k, value) => {
      secureValue = value;
    });

    const result = await store.getItem(key);

    expect(result).toBe(sessionJson);
    expect(secureValue).toEqual(expect.any(String));
    expect(asyncValue).not.toBe(sessionJson);
    expect(asyncValue).toMatch(/^[0-9a-f]+$/);
  });

  it('returns null when nothing is stored', async () => {
    asyncStorage.getItem.mockResolvedValue(null);

    await expect(store.getItem(key)).resolves.toBeNull();
    expect(secureStore.getItemAsync).not.toHaveBeenCalled();
  });

  it('clears both stores on removeItem', async () => {
    asyncStorage.removeItem.mockResolvedValue();
    secureStore.deleteItemAsync.mockResolvedValue();

    await store.removeItem(key);

    expect(asyncStorage.removeItem).toHaveBeenCalledWith(key);
    expect(secureStore.deleteItemAsync).toHaveBeenCalledWith(
      secureKey,
      expect.objectContaining({ keychainAccessible: SecureStore.WHEN_UNLOCKED }),
    );
  });

  it('drops corrupt ciphertext that is not recoverable plaintext', async () => {
    asyncStorage.getItem.mockResolvedValue('not-valid-hex-zz');
    secureStore.getItemAsync.mockResolvedValue('00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff');
    asyncStorage.removeItem.mockResolvedValue();
    secureStore.deleteItemAsync.mockResolvedValue();

    await expect(store.getItem(key)).resolves.toBeNull();
    expect(asyncStorage.removeItem).toHaveBeenCalledWith(key);
  });
});
