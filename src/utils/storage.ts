import { createMMKV } from 'react-native-mmkv';
import { MMKV_KEYS } from './constant';

export const storage = createMMKV({
  id: 'app-storage',
});

export const setToken = (token: string) => {
  storage.set(MMKV_KEYS.AUTH_TOKEN, token);
};

export const setUser = (user: object) => {
  storage.set(MMKV_KEYS.AUTH_USER, JSON.stringify(user));
};

export const getToken = () => {
  return storage.getString(MMKV_KEYS.AUTH_TOKEN);
};

export const getUser = () => {
  const userRaw = storage.getString(MMKV_KEYS.AUTH_USER);
  return userRaw ? JSON.parse(userRaw) : null;
};

export const clearToken = () => {
  storage.remove(MMKV_KEYS.AUTH_TOKEN);
};

export const clearUser = () => {
  storage.remove(MMKV_KEYS.AUTH_USER);
};

export const setSyncedFcmToken = (token: string) => {
  storage.set(MMKV_KEYS.FCM_SYNCED_TOKEN, token);
};

export const getSyncedFcmToken = () => {
  return storage.getString(MMKV_KEYS.FCM_SYNCED_TOKEN);
};

export const clearSyncedFcmToken = () => {
  storage.remove(MMKV_KEYS.FCM_SYNCED_TOKEN);
};
