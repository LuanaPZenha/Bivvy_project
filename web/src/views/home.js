import { GearApi } from '../lib/api.js';
import { isFavorite, toggleFavorite, priceLabel, formatMiles } from '../lib/store.js';
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
      <p class="eyebrow">BIVVY</p>
      <h1>Gear for the next trail</h1>
      <p>Rent or buy camping, hiking, climbing, water, snow, and bike gear near Seattle.</p>
      <div>
        <button class="btn gold" type="button" id="browse-jump">Browse gear</button>
      </div>
    </section>

    <section class="toolbar panel" id="browse">
      <div class="mode-toggle" id="mode-toggle" role="tablist" aria-label="Rent or buy">
        <button type="button" data-mode="rent" class="active">Rent</button>
        <button type="button" data-mode="buy">Buy</button>
      </div>
      <div class="search-row">
        <input id="search" type="search" enterkeyhint="search" autocomplete="off" placeholder="Search tents, kayaks, skis..." />
        <button class="btn gold" id="filters-btn" type="button" aria-expanded="false" aria-controls="filter-root">Filters</button>
      </div>
      <div class="chips scroll-row" id="categories">
        ${CATEGORIES.map(
          ([id, label]) =>
            `<button type="button" class="chip ${id === 'all' ? 'active' : ''}" data-category="${id}">${label}</button>`,
        ).join('')}
      </div>
      <div class="meta" id="feed-meta">Loading…</div>
    </section>

    <div id="filter-root" hidden>
      <button type="button" class="sheet-backdrop" id="filter-backdrop" aria-label="Close filters"></button>
      <div id="filter-panel" class="sheet-panel stack" role="dialog" aria-modal="true" aria-labelledby="filter-title">
        <div class="sheet-handle" aria-hidden="true"></div>
        <div class="sheet-head">
          <h2 id="filter-title">Filters</h2>
          <button type="button" class="btn secondary" id="filter-close">Close</button>
        </div>
        <div class="field">
          <span class="field-label">Distance</span>
          <div class="chips" id="distance-chips">
            ${[5, 10, 25, 50]
              .map(
                (n) =>
                  `<button type="button" class="chip ${n === 25 ? 'active' : ''}" data-distance="${n}">${n} mi</button>`,
              )
              .join('')}
          </div>
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
        <button class="btn" type="button" id="filter-done">Show gear</button>
      </div>
    </div>

    <section class="grid" id="feed"></section>
  `;

  return {
    html,
    bind(root) {
      const feed = root.querySelector('#feed');
      const meta = root.querySelector('#feed-meta');
      const filterRoot = root.querySelector('#filter-root');
      const filtersBtn = root.querySelector('#filters-btn');

      function setFilters(open) {
        filterRoot.hidden = !open;
        filtersBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
        document.body.classList.toggle('sheet-open', open);
      }

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
                <a class="card-stretch" href="#/listing/${listing.id}" data-link="/listing/${listing.id}" aria-label="View ${escapeHtml(listing.title)}"></a>
                <div class="card-thumb ${listing.thumbnailTone === 'brown' ? 'brown' : ''}">
                  ${listing.isPro ? '<span class="badge">PRO</span>' : ''}
                  <button type="button" class="heart ${fav ? 'saved' : ''}" data-fav="${listing.id}" aria-label="${fav ? 'Remove from saved' : 'Save'}">${fav ? '♥' : '♡'}</button>
                </div>
                <div class="card-body">
                  <h3>${escapeHtml(listing.title)}</h3>
                  <div class="meta">${escapeHtml(listing.ownerName)} · ★ ${listing.rating} (${listing.reviewCount})</div>
                  <div class="price">${priceLabel(listing)}</div>
                    <div class="meta">${formatMiles(listing.distanceMiles)} · ${listing.mode}</div>
                </div>
              </article>`;
            })
            .join('');

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

      filtersBtn.addEventListener('click', () => setFilters(filterRoot.hidden));
      root.querySelector('#filter-backdrop').addEventListener('click', () => setFilters(false));
      root.querySelector('#filter-close').addEventListener('click', () => setFilters(false));
      root.querySelector('#filter-done').addEventListener('click', () => setFilters(false));

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

      root.querySelector('#browse-jump').addEventListener('click', () => {
        root.querySelector('#browse')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });

      load();
    },
  };
}
