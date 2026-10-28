import { getUser, clearSession } from '../lib/api.js';
import { getCart, getFavorites } from '../lib/store.js';
import { currentPath, navigate } from '../lib/router.js';
import { escapeHtml } from '../lib/escape.js';

export { escapeHtml };

const ICONS = {
  explore: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M14.8 9.2l-1.3 4.3-4.3 1.3 1.3-4.3 4.3-1.3z"/></svg>`,
  heart: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19s-7-4.4-7-9a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 4.6-7 9-7 9z"/></svg>`,
  bag: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 8h12l-1 12H7L6 8z"/><path d="M9 8V7a3 3 0 0 1 6 0v1"/></svg>`,
  trail: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 18c2-4 4-4 6 0s4 4 6 0 4-4 4 0"/><circle cx="8" cy="7" r="2"/><path d="M14 5l2 3 3-1"/></svg>`,
  user: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3"/><path d="M5 19c1.5-3 3.8-4.5 7-4.5S17.5 16 19 19"/></svg>`,
};

function tabLink({ href, label, icon, active, badge }) {
  return `
    <a class="tab ${active ? 'active' : ''}" href="#${href}" data-link="${href}">
      <span class="tab-icon">${ICONS[icon]}</span>
      <span class="tab-label">${label}</span>
      ${badge ? `<span class="tab-badge">${badge}</span>` : ''}
    </a>
  `;
}

export function renderShell(contentHtml) {
  const user = getUser();
  const cartCount = getCart().length;
  const favCount = getFavorites().length;
  const path = currentPath();
  const accountPaths = ['/profile', '/login', '/register', '/listings'];
  const onAuthScreen = path === '/login' || path === '/register';

  const tabs = [
    { href: '/', label: 'Explore', icon: 'explore', active: path === '/' || path.startsWith('/listing/') },
    { href: '/favorites', label: 'Saved', icon: 'heart', active: path === '/favorites', badge: favCount || '' },
    { href: '/cart', label: 'Cart', icon: 'bag', active: path === '/cart', badge: cartCount || '' },
    { href: '/rentals', label: 'Trips', icon: 'trail', active: path === '/rentals' },
    {
      href: user ? '/profile' : '/login',
      label: 'You',
      icon: 'user',
      active: accountPaths.includes(path),
    },
  ];

  return `
    <div class="shell">
      <header class="topnav">
        <a class="brand" href="#/" data-link="/">
          <img class="brand-mark" src="/favicon.svg" alt="" width="36" height="36" />
          <span>BIVVY</span>
        </a>
        <nav class="nav-actions desktop-nav" aria-label="Account">
          <button class="btn secondary" type="button" data-link="/favorites">Saved (${favCount})</button>
          <button class="btn secondary" type="button" data-link="/cart">Cart (${cartCount})</button>
          ${
            user
              ? `
            <button class="btn secondary" type="button" data-link="/rentals">Rentals</button>
            <button class="btn secondary" type="button" data-link="/listings">My listings</button>
            <button class="btn secondary" type="button" data-link="/profile">${escapeHtml(user.name || 'Profile')}</button>
            <button class="btn" type="button" data-logout>Sign out</button>
          `
              : `
            <button class="btn secondary" type="button" data-link="/login">Sign in</button>
            <button class="btn gold" type="button" data-link="/register">Create account</button>
          `
          }
        </nav>
        ${
          user || onAuthScreen
            ? ''
            : `<button class="btn gold phone-only" type="button" data-link="/login">Sign in</button>`
        }
      </header>
      <main id="view">${contentHtml}</main>
      <p class="footer-note">Bivvy — rent and buy outdoor gear near you.</p>
    </div>
    <nav class="tabbar" aria-label="Primary">
      ${tabs.map(tabLink).join('')}
    </nav>
  `;
}

export function wireShell(root) {
  root.querySelectorAll('[data-link]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      navigate(el.getAttribute('data-link'));
    });
  });
  root.querySelectorAll('[data-logout]').forEach((logout) => {
    logout.addEventListener('click', () => {
      clearSession();
      navigate('/');
    });
  });
}

