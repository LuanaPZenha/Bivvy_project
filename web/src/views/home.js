import { GearApi } from '../lib/api.js';
import { isFavorite, toggleFavorite, priceLabel } from '../lib/store.js';
import { navigate } from '../lib/router.js';
import { escapeHtml } from './layout.js';

const CATEGORIES = [
  ['all', 'All gear'],
  ['camping', 'Camping'],
  ['hiking', 'Hiking'],
  ['climbing', 'Climbing'],
  ['water', 'Water'],
  ['snow', 'Snow'],
  ['bikes', 'Bikes'],
];

export async function renderHome() {
  const state = {
    mode: 'rent',
    category: 'all',
    q: '',
    maxDistance: 25,
    sort: 'distance',
    zip: '98103',
  };

  const html = `
    <section class="hero">
      <div class="brand" style="color:#F3EFE6">BIVVY</div>
      <h1>Gear for the next trail</h1>
      <p>Rent or buy camping, hiking, climbing, water, snow, and bike gear near Seattle.</p>
      <div>
        <button class="btn gold" data-link="/register">Start exploring</button>
      </div>
    </section>

    <section class="toolbar panel">
      <div class="mode-toggle" id="mode-toggle">
        <button type="button" data-mode="rent" class="active">Rent</button>
        <button type="button" data-mode="buy">Buy</button>
      </div>
      <div class="search-row">
        <input id="search" placeholder="Search tents, kayaks, skis..." />
        <button class="btn gold" id="filters-btn" type="button">Filters</button>
      </div>
      <div class="chips" id="categories">
        ${CATEGORIES.map(
          ([id, label]) =>
            `<button class="chip ${id === 'all' ? 'active' : ''}" data-category="${id}">${label}</button>`,
        ).join('')}
      </div>
      <div id="filter-panel" class="stack" hidden>
        <div class="chips" id="distance-chips">
          ${[5, 10, 25, 50]
            .map(
              (n) =>
                `<button class="chip ${n === 25 ? 'active' : ''}" data-distance="${n}">${n} mi</button>`,
            )
            .join('')}
        </div>
        <div class="field">
          <label for="sort">Sort by</label>
          <select id="sort">
            <option value="distance">Nearest</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
            <option value="rating">Top rated</option>
          </select>
        </div>
      </div>
      <div class="meta" id="feed-meta">Loading…</div>
    </section>

    <section class="grid" id="feed"></section>
  `;

  return {
    html,
    bind(root) {
      const feed = root.querySelector('#feed');
      const meta = root.querySelector('#feed-meta');
      const filterPanel = root.querySelector('#filter-panel');

      async function load() {
        meta.textContent = 'Loading…';
        try {
          const data = await GearApi.near({
            mode: state.mode,
            category: state.category,
            q: state.q,
            maxDistance: state.maxDistance,
            sort: state.sort,
            zip: state.zip,
          });
          meta.textContent = `${data.count} listing${data.count === 1 ? '' : 's'} · ≤${state.maxDistance} mi`;
          feed.innerHTML = data.listings
            .map((listing) => {
              const fav = isFavorite(listing.id);
              return `
              <article class="card">
                <div class="card-thumb ${listing.thumbnailTone === 'brown' ? 'brown' : ''}">
                  ${listing.isPro ? '<span class="badge">PRO</span>' : ''}
                  <button class="heart" data-fav="${listing.id}" aria-label="Save">${fav ? '♥' : '♡'}</button>
                </div>
                <div class="card-body">
                  <h3><a href="#/listing/${listing.id}">${escapeHtml(listing.title)}</a></h3>
                  <div class="meta">${escapeHtml(listing.ownerName)} · ★ ${listing.rating} (${listing.reviewCount})</div>
                  <div class="price">${priceLabel(listing)}</div>
                  <div class="meta">${listing.distanceMiles} mi · ${listing.mode}</div>
                  <button class="btn" data-open="${listing.id}">View</button>
                </div>
              </article>`;
            })
            .join('');

          feed.querySelectorAll('[data-open]').forEach((btn) => {
            btn.addEventListener('click', () => navigate(`/listing/${btn.dataset.open}`));
          });
          feed.querySelectorAll('[data-fav]').forEach((btn) => {
            btn.addEventListener('click', (e) => {
              e.stopPropagation();
              const listing = data.listings.find((l) => l.id === btn.dataset.fav);
              if (!listing) return;
              toggleFavorite(listing);
              load();
            });
          });
        } catch (err) {
          meta.textContent = err.message;
          feed.innerHTML = `<div class="panel error">${escapeHtml(err.message)}</div>`;
        }
      }

      root.querySelector('#mode-toggle').addEventListener('click', (e) => {
        const btn = e.target.closest('[data-mode]');
        if (!btn) return;
        state.mode = btn.dataset.mode;
        root.querySelectorAll('#mode-toggle button').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        load();
      });

      root.querySelector('#categories').addEventListener('click', (e) => {
        const btn = e.target.closest('[data-category]');
        if (!btn) return;
        state.category = btn.dataset.category;
        root.querySelectorAll('#categories .chip').forEach((c) => c.classList.remove('active'));
        btn.classList.add('active');
        load();
      });

      let timer;
      root.querySelector('#search').addEventListener('input', (e) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          state.q = e.target.value.trim();
          load();
        }, 250);
      });

      root.querySelector('#filters-btn').addEventListener('click', () => {
        filterPanel.hidden = !filterPanel.hidden;
      });

      root.querySelector('#distance-chips').addEventListener('click', (e) => {
        const btn = e.target.closest('[data-distance]');
        if (!btn) return;
        state.maxDistance = Number(btn.dataset.distance);
        root.querySelectorAll('#distance-chips .chip').forEach((c) => c.classList.remove('active'));
        btn.classList.add('active');
        load();
      });

      root.querySelector('#sort').addEventListener('change', (e) => {
        state.sort = e.target.value;
        load();
      });

      root.querySelector('[data-link="/register"]')?.addEventListener('click', (e) => {
        e.preventDefault();
        navigate('/register');
      });

      load();
    },
  };
}
