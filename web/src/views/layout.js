import { getUser, clearSession } from '../lib/api.js';
import { getCart, getFavorites } from '../lib/store.js';
import { navigate } from '../lib/router.js';

export function renderShell(contentHtml) {
  const user = getUser();
  const cartCount = getCart().length;
  const favCount = getFavorites().length;

  return `
    <div class="shell">
      <header class="topnav">
        <a class="brand" href="#/" data-link="/">
          <span class="brand-mark">🌲</span>
          <span>BIVVY</span>
        </a>
        <nav class="nav-actions">
          <button class="btn secondary" data-link="/favorites">Saved (${favCount})</button>
          <button class="btn secondary" data-link="/cart">Cart (${cartCount})</button>
          ${
            user
              ? `
            <button class="btn secondary" data-link="/rentals">Rentals</button>
            <button class="btn secondary" data-link="/listings">My listings</button>
            <button class="btn secondary" data-link="/profile">${escapeHtml(user.name || 'Profile')}</button>
            <button class="btn" id="logout-btn">Sign out</button>
          `
              : `
            <button class="btn secondary" data-link="/login">Sign in</button>
            <button class="btn gold" data-link="/register">Create account</button>
          `
          }
        </nav>
      </header>
      <main id="view">${contentHtml}</main>
      <p class="footer-note">Bivvy — rent and buy outdoor gear near you. Built in JavaScript.</p>
    </div>
  `;
}

export function wireShell(root) {
  root.querySelectorAll('[data-link]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      navigate(el.getAttribute('data-link'));
    });
  });
  const logout = root.querySelector('#logout-btn');
  if (logout) {
    logout.addEventListener('click', () => {
      clearSession();
      navigate('/');
    });
  }
}

export function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}
