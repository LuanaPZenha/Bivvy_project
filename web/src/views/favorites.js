import { getFavorites, priceLabel, toggleFavorite } from '../lib/store.js';
import { navigate } from '../lib/router.js';
import { escapeHtml } from './layout.js';

export function renderFavorites() {
  const items = getFavorites();
  return {
    html: `
      <section class="panel stack">
        <h1 style="margin:0;font-family:Fraunces,serif">Saved gear</h1>
        ${
          items.length === 0
            ? '<p class="muted">No saved listings yet. Tap ♥ on Explore.</p>'
            : `<div class="grid">${items
                .map(
                  (listing) => `
              <article class="card">
                <div class="card-body">
                  <h3>${escapeHtml(listing.title)}</h3>
                  <div class="price">${priceLabel(listing)}</div>
                  <button class="btn" data-open="${listing.id}">Open</button>
                  <button class="btn secondary" data-remove="${listing.id}">Remove</button>
                </div>
              </article>`,
                )
                .join('')}</div>`
        }
      </section>
    `,
    bind(root) {
      root.querySelectorAll('[data-open]').forEach((btn) => {
        btn.addEventListener('click', () => navigate(`/listing/${btn.dataset.open}`));
      });
      root.querySelectorAll('[data-remove]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const listing = items.find((i) => i.id === btn.dataset.remove);
          if (listing) toggleFavorite(listing);
          navigate('/favorites');
        });
      });
    },
  };
}
