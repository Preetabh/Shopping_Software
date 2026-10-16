import { Platform } from 'react-native';

let asyncStorageInstance: any = null;
try {
  const mod = require('@react-native-async-storage/async-storage');
  asyncStorageInstance = mod.default || mod;
} catch (e) {
  // Not available or not linked
}

// In-memory fallback
const memoryStorage = new Map<string, string>();

export const storage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
      if (asyncStorageInstance && typeof asyncStorageInstance.getItem === 'function') {
        const val = await asyncStorageInstance.getItem(key);
        if (val !== null && val !== undefined) return val;
      }
    } catch (e) {
      // Ignore native storage failures and fall through to web / memory fallback
    }

    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        return window.localStorage.getItem(key);
      } catch (_) {}
    }
    return memoryStorage.get(key) || null;
  },

  setItem: async (key: string, value: string): Promise<void> => {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
        return;
      }
      if (asyncStorageInstance && typeof asyncStorageInstance.setItem === 'function') {
        await asyncStorageInstance.setItem(key, value);
        return;
      }
    } catch (e) {
      // Ignore native storage failures and fall through to web / memory fallback
    }

    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(key, value);
        return;
      } catch (_) {}
    }
    memoryStorage.set(key, value);
  },

  removeItem: async (key: string): Promise<void> => {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
        return;
      }
      if (asyncStorageInstance && typeof asyncStorageInstance.removeItem === 'function') {
        await asyncStorageInstance.removeItem(key);
        return;
      }
    } catch (e) {
      // Fallback
    }

    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.removeItem(key);
        return;
      } catch (_) {}
    }
    memoryStorage.delete(key);
  },

  clear: async (): Promise<void> => {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.clear();
        return;
      }
      if (asyncStorageInstance && typeof asyncStorageInstance.clear === 'function') {
        await asyncStorageInstance.clear();
        return;
      }
    } catch (e) {
      // Fallback
    }

    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.clear();
        return;
      } catch (_) {}
    }
    memoryStorage.clear();
  }
};

export default storage;
