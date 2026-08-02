import * as SecureStore from 'expo-secure-store';
import type { AuthUser } from '../types/user';

const ACCESS_KEY = 'bivvy_access_token';
const REFRESH_KEY = 'bivvy_refresh_token';
const USER_KEY = 'bivvy_user';

/**
 * Secure credential storage (iOS Keychain / Android Keystore).
 * Never use AsyncStorage for tokens.
 */
export async function saveTokens(accessToken: string, refreshToken: string): Promise<void> {
  await SecureStore.setItemAsync(ACCESS_KEY, accessToken);
  await SecureStore.setItemAsync(REFRESH_KEY, refreshToken);
}

export async function getAccessToken(): Promise<string | null> {
  return SecureStore.getItemAsync(ACCESS_KEY);
}

export async function getRefreshToken(): Promise<string | null> {
  return SecureStore.getItemAsync(REFRESH_KEY);
}

export async function saveUser(user: AuthUser): Promise<void> {
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
}

export async function getStoredUser(): Promise<AuthUser | null> {
  const raw = await SecureStore.getItemAsync(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export async function clearSession(): Promise<void> {
  await SecureStore.deleteItemAsync(ACCESS_KEY);
  await SecureStore.deleteItemAsync(REFRESH_KEY);
  await SecureStore.deleteItemAsync(USER_KEY);
}

/** @deprecated Prefer clearSession */
export async function clearTokens(): Promise<void> {
  await clearSession();
}
