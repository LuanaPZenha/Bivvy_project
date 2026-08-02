import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import type { AuthUser } from '../types/user';

const ACCESS_KEY = 'bivvy_access_token';
const REFRESH_KEY = 'bivvy_refresh_token';
const USER_KEY = 'bivvy_user';

async function setItem(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    if (typeof localStorage !== 'undefined') localStorage.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function getItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(key);
  }
  return SecureStore.getItemAsync(key);
}

async function deleteItem(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    if (typeof localStorage !== 'undefined') localStorage.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

/**
 * Secure credential storage (iOS Keychain / Android Keystore).
 * Web uses localStorage only as a bootstrap fallback — never for production native.
 */
export async function saveTokens(accessToken: string, refreshToken: string): Promise<void> {
  await setItem(ACCESS_KEY, accessToken);
  await setItem(REFRESH_KEY, refreshToken);
}

export async function getAccessToken(): Promise<string | null> {
  try {
    return await getItem(ACCESS_KEY);
  } catch {
    return null;
  }
}

export async function getRefreshToken(): Promise<string | null> {
  try {
    return await getItem(REFRESH_KEY);
  } catch {
    return null;
  }
}

export async function saveUser(user: AuthUser): Promise<void> {
  await setItem(USER_KEY, JSON.stringify(user));
}

export async function getStoredUser(): Promise<AuthUser | null> {
  try {
    const raw = await getItem(USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export async function clearSession(): Promise<void> {
  await Promise.allSettled([
    deleteItem(ACCESS_KEY),
    deleteItem(REFRESH_KEY),
    deleteItem(USER_KEY),
  ]);
}

/** @deprecated Prefer clearSession */
export async function clearTokens(): Promise<void> {
  await clearSession();
}
