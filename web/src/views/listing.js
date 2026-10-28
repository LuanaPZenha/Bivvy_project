import { GearApi, BookingsApi, getUser } from '../lib/api.js';
import { addToCart, isFavorite, toggleFavorite, priceLabel, formatMiles } from '../lib/store.js';
import { navigate } from '../lib/router.js';
import { escapeHtml } from './layout.js';

function defaultDates() {
  const start = new Date();
  start.setUTCDate(start.getUTCDate() + 1);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 3);
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
}

export async function renderListing(id) {
  let listing;
  let reviews = [];
  try {
    listing = await GearApi.get(id);
    const rev = await GearApi.reviews(id);
    reviews = rev.reviews || [];
  } catch (err) {
    return {
      html: `<div class="panel error">${escapeHtml(err.message)}</div>`,
      bind() {},
    };
  }

  const dates = defaultDates();
  const html = `
    <button class="btn secondary back-btn" type="button" data-back>← Back</button>
    <div class="split detail-layout">
      <section class="panel stack detail-hero">
        <div class="card-thumb detail-thumb ${listing.thumbnailTone === 'brown' ? 'brown' : ''}">
          ${listing.isPro ? '<span class="badge">PRO</span>' : ''}
          <button type="button" class="heart ${isFavorite(listing.id) ? 'saved' : ''}" id="fav-btn" aria-label="Save">${isFavorite(listing.id) ? '♥' : '♡'}</button>
        </div>
        <div class="meta">${listing.mode === 'rent' ? 'For rent' : 'For sale'}</div>
        <h1 class="page-title">${escapeHtml(listing.title)}</h1>
        <div class="price">${priceLabel(listing)}</div>
        <div class="meta">${escapeHtml(listing.ownerName)} · ★ ${listing.rating} (${listing.reviewCount}) · ${formatMiles(listing.distanceMiles)}</div>
      </section>
      <aside class="panel stack booking-panel" id="booking-panel">
        ${
          listing.mode === 'rent'
            ? `
          <h2 class="section-title">Request rental</h2>
          <div class="field"><label for="start">Start date</label><input id="start" type="date" value="${dates.startDate}" /></div>
          <div class="field"><label for="end">End date</label><input id="end" type="date" value="${dates.endDate}" /></div>
          <div class="field note-field"><label for="message">Message</label><textarea id="message" rows="3" placeholder="Pickup notes…"></textarea></div>
        `
            : `
          <h2 class="section-title">Buy this gear</h2>
          <div class="field note-field"><label for="message">Message</label><textarea id="message" rows="3" placeholder="Pickup notes…"></textarea></div>
        `
        }
        <div class="book-dock ${listing.mode === 'rent' ? 'rent' : 'buy'}">
          <div id="book-status"></div>
          <div class="dock-price">
            <strong id="quote-total">…</strong>
            <span class="meta" id="quote-note">incl. fees & tax</span>
          </div>
          ${
            listing.mode === 'rent'
              ? `<button class="btn" type="button" id="book-btn">Request</button>`
              : `<button class="btn secondary" type="button" id="cart-btn">Add to cart</button>
                 <button class="btn" type="button" id="buy-btn">Buy now</button>`
          }
        </div>
      </aside>
      <section class="panel stack detail-copy">
        <p>${escapeHtml(listing.description)}</p>
        <h2 class="section-title">Reviews</h2>
        <div class="stack" id="reviews">
          ${
            reviews.length
              ? reviews
                  .map(
                    (r) =>
                      `<div class="list-row"><div><strong>${escapeHtml(r.reviewerName)}</strong> · ★ ${r.rating}<div class="meta">${escapeHtml(r.comment || '')}</div></div></div>`,
                  )
                  .join('')
              : '<div class="muted">No reviews yet.</div>'
          }
        </div>
      </section>
    </div>
  `;

  return {
    html,
    bind(root) {
      root.querySelector('[data-back]').addEventListener('click', () => navigate('/'));
      root.querySelector('#fav-btn').addEventListener('click', () => {
        toggleFavorite(listing);
        const favBtn = root.querySelector('#fav-btn');
        const saved = isFavorite(listing.id);
        favBtn.textContent = saved ? '♥' : '♡';
        favBtn.classList.toggle('saved', saved);
        favBtn.setAttribute('aria-label', saved ? 'Remove from saved' : 'Save');
      });

      const totalEl = root.querySelector('#quote-total');
      const noteEl = root.querySelector('#quote-note');
      const statusEl = root.querySelector('#book-status');

      async function refreshQuote() {
        try {
          const body =
            listing.mode === 'rent'
              ? {
                  startDate: root.querySelector('#start').value,
                  endDate: root.querySelector('#end').value,
                }
              : {};
          const quote = await GearApi.quote(listing.id, body);
          totalEl.textContent = `$${quote.pricing.total.toFixed(2)}`;
          noteEl.textContent = 'incl. fees & tax';
        } catch (err) {
          totalEl.textContent = '—';
          noteEl.textContent = err.message;
        }
      }

      if (listing.mode === 'rent') {
        root.querySelector('#start').addEventListener('change', refreshQuote);
        root.querySelector('#end').addEventListener('change', refreshQuote);
        root.querySelector('#book-btn').addEventListener('click', async () => {
          if (!getUser()) {
            navigate('/login');
            return;
          }
          statusEl.textContent = 'Sending…';
          try {
            await BookingsApi.create({
              listingId: listing.id,
              startDate: root.querySelector('#start').value,
              endDate: root.querySelector('#end').value,
              message: root.querySelector('#message').value,
            });
            statusEl.innerHTML = '<span class="success">Request sent. Track it under Rentals.</span>';
          } catch (err) {
            statusEl.innerHTML = `<span class="error">${escapeHtml(err.message)}</span>`;
          }
        });
      } else {
        root.querySelector('#buy-btn').addEventListener('click', async () => {
          if (!getUser()) {
            navigate('/login');
            return;
          }
          try {
            await BookingsApi.create({
              listingId: listing.id,
              message: root.querySelector('#message').value,
            });
            statusEl.innerHTML = '<span class="success">Purchase request sent.</span>';
          } catch (err) {
            statusEl.innerHTML = `<span class="error">${escapeHtml(err.message)}</span>`;
          }
        });
        root.querySelector('#cart-btn').addEventListener('click', () => {
          try {
            addToCart(listing);
            statusEl.innerHTML = '<span class="success">Added to cart.</span>';
          } catch (err) {
            statusEl.innerHTML = `<span class="error">${escapeHtml(err.message)}</span>`;
          }
        });
      }

      refreshQuote();
    },
  };
}
