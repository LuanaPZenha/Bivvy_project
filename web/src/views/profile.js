import { getUser } from '../lib/api.js';
import { navigate } from '../lib/router.js';
import { escapeHtml } from './layout.js';

export function renderProfile() {
  const user = getUser();
  if (!user) {
    return {
      html: `<div class="panel">Please <a href="#/login">sign in</a>.</div>`,
      bind() {},
    };
  }
  return {
    html: `
      <section class="panel stack">
        <h1 style="margin:0;font-family:Fraunces,serif">Profile</h1>
        <div class="meta">${escapeHtml(user.name)} · ${escapeHtml(user.email)}</div>
        <div class="stack">
          <button class="btn secondary" data-go="/rentals">My rentals & messages</button>
          <button class="btn secondary" data-go="/listings">My listings</button>
          <button class="btn secondary" data-go="/favorites">Saved gear</button>
          <button class="btn secondary" data-go="/cart">Cart</button>
        </div>
      </section>
    `,
    bind(root) {
      root.querySelectorAll('[data-go]').forEach((btn) => {
        btn.addEventListener('click', () => navigate(btn.dataset.go));
      });
    },
  };
}
