import { getAccessToken, getRefreshToken, saveTokens } from '../security/secureCredentials';
import {
  Booking,
  BookingPricing,
  Listing,
  MarketMode,
  GearCategory,
  normalizeListing,
} from '../types/listing';
import type { AuthTokensResponse } from '../types/user';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

type RequestOptions = {
  method?: string;
  body?: unknown;
  auth?: boolean;
};

type RefreshTokens = {
  accessToken: string;
  refreshToken: string;
};

async function trySilentRefresh(): Promise<boolean> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${API_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return false;
    const data = (await res.json()) as RefreshTokens;
    if (!data.accessToken || !data.refreshToken) return false;
    await saveTokens(data.accessToken, data.refreshToken);
    return true;
  } catch {
    return false;
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
  retried = false,
): Promise<T> {
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

  if (res.status === 401 && options.auth && !retried) {
    const refreshed = await trySilentRefresh();
    if (refreshed) {
      return apiRequest<T>(path, options, true);
    }
  }

  if (!res.ok) {
    const errBody = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(errBody.error || `Request failed (${res.status})`);
  }

  if (res.status === 204) {
    return undefined as T;
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

export type RegisterPayload = {
  email: string;
  password: string;
  name?: string;
  phone?: string;
  acceptTerms: boolean;
  marketingOptIn?: boolean;
};

export async function registerRequest(payload: RegisterPayload): Promise<AuthTokensResponse> {
  return apiRequest<AuthTokensResponse>('/api/auth/register', {
    method: 'POST',
    body: payload,
  });
}

export async function googleLoginRequest(idToken: string): Promise<AuthTokensResponse> {
  return apiRequest<AuthTokensResponse>('/api/auth/google', {
    method: 'POST',
    body: { idToken },
  });
}

export type NearYouParams = {
  category?: GearCategory;
  mode?: MarketMode | 'all';
  q?: string;
  zip?: string;
  maxDistance?: number;
};

export type NearYouResponse = {
  count: number;
  zipCode?: string | null;
  listings: Listing[];
};

export async function fetchNearYou(params: NearYouParams = {}): Promise<NearYouResponse> {
  const search = new URLSearchParams();
  if (params.category && params.category !== 'all') search.set('category', params.category);
  else if (params.category === 'all') search.set('category', 'all');
  if (params.mode) search.set('mode', params.mode);
  if (params.q?.trim()) search.set('q', params.q.trim());
  if (params.zip) search.set('zip', params.zip);
  if (params.maxDistance != null) search.set('maxDistance', String(params.maxDistance));

  const qs = search.toString();
  const raw = await apiRequest<{ count: number; zipCode?: string | null; listings: unknown[] }>(
    `/api/gear/near${qs ? `?${qs}` : ''}`,
  );
  const listings = (raw.listings || []).map(normalizeListing);
  return { count: listings.length, zipCode: raw.zipCode, listings };
}

export async function fetchListingById(id: string): Promise<Listing> {
  const raw = await apiRequest<unknown>(`/api/gear/${encodeURIComponent(id)}`);
  return normalizeListing(raw);
}

export type QuoteResponse = {
  listingId: string;
  mode: MarketMode;
  startDate?: string;
  endDate?: string;
  pricing: BookingPricing;
};

export async function quoteBookingRequest(
  listingId: string,
  body: { startDate?: string; endDate?: string },
): Promise<QuoteResponse> {
  return apiRequest<QuoteResponse>(`/api/gear/${encodeURIComponent(listingId)}/quote`, {
    method: 'POST',
    body,
  });
}

export type CreateBookingResponse = {
  booking: Booking;
  listing: Listing;
};

export async function createBookingRequest(body: {
  listingId: string;
  startDate?: string;
  endDate?: string;
  message?: string;
}): Promise<CreateBookingResponse> {
  const raw = await apiRequest<{ booking: Booking; listing: unknown }>('/api/bookings', {
    method: 'POST',
    auth: true,
    body,
  });
  return {
    booking: raw.booking,
    listing: normalizeListing(raw.listing),
  };
}

export type MyBookingsResponse = {
  count: number;
  bookings: Booking[];
};

export async function fetchMyBookings(): Promise<MyBookingsResponse> {
  return apiRequest<MyBookingsResponse>('/api/bookings', { auth: true });
}

export async function updateBookingStatusRequest(
  bookingId: string,
  status: Booking['status'],
): Promise<Booking> {
  return apiRequest<Booking>(`/api/bookings/${encodeURIComponent(bookingId)}`, {
    method: 'PATCH',
    auth: true,
    body: { status },
  });
}

export async function checkoutBookingRequest(
  bookingId: string,
): Promise<{ booking: Booking; message: string }> {
  return apiRequest<{ booking: Booking; message: string }>(
    `/api/bookings/${encodeURIComponent(bookingId)}/checkout`,
    {
      method: 'POST',
      auth: true,
    },
  );
}

export type MyListingsResponse = {
  count: number;
  listings: Listing[];
};

export async function fetchMyListings(): Promise<MyListingsResponse> {
  const raw = await apiRequest<{ count?: number; listings?: unknown[] } | unknown[]>(
    '/api/listings/mine',
    { auth: true },
  );
  if (Array.isArray(raw)) {
    const listings = raw.map(normalizeListing);
    return { count: listings.length, listings };
  }
  const listings = (raw.listings || []).map(normalizeListing);
  return { count: listings.length, listings };
}

export type CreateListingPayload = {
  title: string;
  category?: Exclude<GearCategory, 'all'>;
  mode?: MarketMode;
  pricePerDay?: number;
  buyPrice?: number;
  description?: string;
  zipCode?: string;
  location?: string;
  isPro?: boolean;
  thumbnailTone?: 'forest' | 'brown';
};

export async function createListingRequest(payload: CreateListingPayload): Promise<Listing> {
  const raw = await apiRequest<unknown>('/api/listings', {
    method: 'POST',
    auth: true,
    body: payload,
  });
  return normalizeListing(raw);
}

export type UploadListingImageResponse = {
  listingId: string;
  image: { id: string; contentType?: string; size?: number; createdAt?: string };
  images: unknown[];
};

export async function uploadListingImage(
  listingId: string,
  localUri: string,
  options?: { mimeType?: string; fileName?: string },
): Promise<UploadListingImageResponse> {
  const token = await getAccessToken();
  const form = new FormData();
  const fileName = options?.fileName || `photo-${Date.now()}.jpg`;
  const mimeType = options?.mimeType || 'image/jpeg';

  if (typeof window !== 'undefined' && localUri.startsWith('blob:')) {
    const blob = await fetch(localUri).then((r) => r.blob());
    form.append('image', blob, fileName);
  } else if (typeof window !== 'undefined' && localUri.startsWith('data:')) {
    const blob = await fetch(localUri).then((r) => r.blob());
    form.append('image', blob, fileName);
  } else if (typeof window !== 'undefined') {
    // Expo web often returns a normal https/file URL or blob URL.
    const blob = await fetch(localUri).then((r) => r.blob());
    form.append('image', blob, fileName);
  } else {
    form.append('image', {
      uri: localUri,
      name: fileName,
      type: mimeType,
    } as unknown as Blob);
  }

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}/api/listings/${encodeURIComponent(listingId)}/images`, {
    method: 'POST',
    headers,
    body: form,
  });

  if (!res.ok) {
    const errBody = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(errBody.error || `Upload failed (${res.status})`);
  }

  return res.json() as Promise<UploadListingImageResponse>;
}

export type CartCheckoutResponse = {
  count: number;
  bookings: CreateBookingResponse[];
};

export async function checkoutCartRequest(body: {
  listingIds: string[];
  message?: string;
}): Promise<CartCheckoutResponse> {
  const raw = await apiRequest<{
    count: number;
    bookings: { booking: Booking; listing: unknown }[];
  }>('/api/cart/checkout', {
    method: 'POST',
    auth: true,
    body,
  });
  return {
    count: raw.count,
    bookings: (raw.bookings || []).map((row) => ({
      booking: row.booking,
      listing: normalizeListing(row.listing),
    })),
  };
}

