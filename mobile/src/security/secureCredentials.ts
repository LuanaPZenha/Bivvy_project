import * as SecureStore from 'expo-secure-store';

const ACCESS_KEY = 'bivvy_access_token';
const REFRESH_KEY = 'bivvy_refresh_token';

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

export async function clearTokens(): Promise<void> {
  await SecureStore.deleteItemAsync(ACCESS_KEY);
  await SecureStore.deleteItemAsync(REFRESH_KEY);
}
