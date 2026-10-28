const FAV_KEY = 'bivvy_favorites_v2';
const CART_KEY = 'bivvy_cart_v2';

function load(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
  } catch {
    return fallback;
  }
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getFavorites() {
  return load(FAV_KEY, []);
}

export function toggleFavorite(listing) {
  const items = getFavorites();
  const idx = items.findIndex((x) => x.id === listing.id);
  if (idx >= 0) items.splice(idx, 1);
  else items.push(listing);
  save(FAV_KEY, items);
  return items;
}

export function isFavorite(id) {
  return getFavorites().some((x) => x.id === id);
}

export function getCart() {
  return load(CART_KEY, []);
}

export function addToCart(listing) {
  if (listing.mode !== 'buy') throw new Error('Only buy listings can go in the cart');
  const items = getCart();
  if (!items.some((x) => x.id === listing.id)) items.push(listing);
  save(CART_KEY, items);
  return items;
}

export function removeFromCart(id) {
  const items = getCart().filter((x) => x.id !== id);
  save(CART_KEY, items);
  return items;
}

export function clearCart() {
  save(CART_KEY, []);
}

export function formatMiles(miles) {
  const n = Number(miles);
  if (!Number.isFinite(n)) return '';
  if (n < 0.1) return '< 0.1 mi';
  return `${n.toFixed(1)} mi`;
}

export function priceLabel(listing) {
  if (listing.mode === 'buy') return `$${listing.buyPrice ?? 0}`;
  return `$${listing.pricePerDay ?? 0} / day`;
}
