const API_BASE = import.meta.env.VITE_API_URL || '';

function getToken() {
  return localStorage.getItem('bivvy_token') || '';
}

export function setSession({ accessToken, user }) {
  if (accessToken) localStorage.setItem('bivvy_token', accessToken);
  if (user) localStorage.setItem('bivvy_user', JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem('bivvy_token');
  localStorage.removeItem('bivvy_user');
}

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem('bivvy_user') || 'null');
  } catch {
    return null;
  }
}

export async function api(path, { method = 'GET', body, auth = false } = {}) {
  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

export const AuthApi = {
  register: (body) => api('/api/auth/register', { method: 'POST', body }),
  login: (body) => api('/api/auth/login', { method: 'POST', body }),
  me: () => api('/api/auth/me', { auth: true }),
};

export const GearApi = {
  near: (params = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v != null && v !== '') qs.set(k, String(v));
    });
    return api(`/api/gear/near?${qs}`);
  },
  get: (id) => api(`/api/gear/${encodeURIComponent(id)}`),
  quote: (id, body) => api(`/api/gear/${encodeURIComponent(id)}/quote`, { method: 'POST', body }),
  reviews: (id) => api(`/api/gear/${encodeURIComponent(id)}/reviews`),
};

export const ListingsApi = {
  mine: () => api('/api/listings/mine', { auth: true }),
  create: (body) => api('/api/listings', { method: 'POST', auth: true, body }),
  update: (id, body) =>
    api(`/api/listings/${encodeURIComponent(id)}`, { method: 'PATCH', auth: true, body }),
  remove: (id) =>
    api(`/api/listings/${encodeURIComponent(id)}`, { method: 'DELETE', auth: true }),
  review: (id, body) =>
    api(`/api/listings/${encodeURIComponent(id)}/reviews`, { method: 'POST', auth: true, body }),
};

export const BookingsApi = {
  list: () => api('/api/bookings', { auth: true }),
  create: (body) => api('/api/bookings', { method: 'POST', auth: true, body }),
  updateStatus: (id, status) =>
    api(`/api/bookings/${encodeURIComponent(id)}`, { method: 'PATCH', auth: true, body: { status } }),
  checkout: (id) =>
    api(`/api/bookings/${encodeURIComponent(id)}/checkout`, { method: 'POST', auth: true, body: {} }),
  messages: (id) => api(`/api/bookings/${encodeURIComponent(id)}/messages`, { auth: true }),
  postMessage: (id, body) =>
    api(`/api/bookings/${encodeURIComponent(id)}/messages`, {
      method: 'POST',
      auth: true,
      body: { body },
    }),
};

export const CartApi = {
  checkout: (listingIds, message) =>
    api('/api/cart/checkout', { method: 'POST', auth: true, body: { listingIds, message } }),
};
