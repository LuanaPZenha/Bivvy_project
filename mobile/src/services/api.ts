import { getAccessToken } from '../security/secureCredentials';
import type { AuthTokensResponse } from '../types/user';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

type RequestOptions = {
  method?: string;
  body?: unknown;
  auth?: boolean;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  if (options.auth) {
    const token = await getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    const errBody = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(errBody.error || `Request failed (${res.status})`);
  }

  return res.json() as Promise<T>;
}

export function getApiBaseUrl(): string {
  return API_URL;
}

export async function loginRequest(email: string, password: string): Promise<AuthTokensResponse> {
  return apiRequest<AuthTokensResponse>('/api/auth/login', {
    method: 'POST',
    body: { email, password },
  });
}

export async function registerRequest(
  email: string,
  password: string,
  name?: string,
): Promise<AuthTokensResponse> {
  return apiRequest<AuthTokensResponse>('/api/auth/register', {
    method: 'POST',
    body: { email, password, name },
  });
}

export async function googleLoginRequest(idToken: string): Promise<AuthTokensResponse> {
  return apiRequest<AuthTokensResponse>('/api/auth/google', {
    method: 'POST',
    body: { idToken },
  });
}
