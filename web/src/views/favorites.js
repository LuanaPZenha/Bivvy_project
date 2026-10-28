import { getFavorites, priceLabel, toggleFavorite } from '../lib/store.js';
import { navigate } from '../lib/router.js';
import { escapeHtml } from './layout.js';

export function renderFavorites() {
  const items = getFavorites();
  return {
    html: `
      <section class="panel stack">
        <h1 class="page-title">Saved gear</h1>
        ${
          items.length === 0
            ? '<p class="muted">No saved listings yet. Tap ♥ on Explore.</p>'
            : `<div class="grid">${items
                .map(
                  (listing) => `
              <article class="card">
                <a class="card-link" href="#/listing/${listing.id}" data-link="/listing/${listing.id}">
                  <div class="card-body">
                    <h3>${escapeHtml(listing.title)}</h3>
                    <div class="price">${priceLabel(listing)}</div>
                  </div>
                </a>
                <div class="card-actions">
                  <button class="btn secondary" type="button" data-remove="${listing.id}">Remove</button>
                </div>
              </article>`,
                )
                .join('')}</div>`
        }
      </section>
    `,
    bind(root) {
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
