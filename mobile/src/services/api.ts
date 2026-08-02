import { getAccessToken } from '../security/secureCredentials';

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
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.error || `Request failed (${res.status})`);
  }

  return res.json() as Promise<T>;
}

export function getApiBaseUrl(): string {
  return API_URL;
}
