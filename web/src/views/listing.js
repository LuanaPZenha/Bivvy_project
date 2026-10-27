import { GearApi, BookingsApi, getUser } from '../lib/api.js';
import { addToCart, isFavorite, toggleFavorite, priceLabel } from '../lib/store.js';
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
    <button class="btn secondary" data-back>← Back</button>
    <div class="split" style="margin-top:16px">
      <section class="panel stack">
        <div class="card-thumb ${listing.thumbnailTone === 'brown' ? 'brown' : ''}" style="height:240px;border-radius:12px">
          ${listing.isPro ? '<span class="badge">PRO</span>' : ''}
          <button class="heart" id="fav-btn">${isFavorite(listing.id) ? '♥' : '♡'}</button>
        </div>
        <div class="meta">${listing.mode === 'rent' ? 'For rent' : 'For sale'}</div>
        <h1 style="margin:0;font-family:Fraunces,serif">${escapeHtml(listing.title)}</h1>
        <div class="price">${priceLabel(listing)}</div>
        <div class="meta">${escapeHtml(listing.ownerName)} · ★ ${listing.rating} (${listing.reviewCount}) · ${listing.distanceMiles} mi</div>
        <p>${escapeHtml(listing.description)}</p>
        <h3>Reviews</h3>
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
      <aside class="panel stack" id="booking-panel">
        ${
          listing.mode === 'rent'
            ? `
          <h3 style="margin:0">Request rental</h3>
          <div class="field"><label>Start date</label><input id="start" type="date" value="${dates.startDate}" /></div>
          <div class="field"><label>End date</label><input id="end" type="date" value="${dates.endDate}" /></div>
          <div class="field"><label>Message</label><textarea id="message" rows="3" placeholder="Pickup notes…"></textarea></div>
          <div class="meta" id="quote">Quote loading…</div>
          <button class="btn" id="book-btn">Send rental request</button>
        `
            : `
          <h3 style="margin:0">Buy this gear</h3>
          <div class="field"><label>Message</label><textarea id="message" rows="3" placeholder="Pickup notes…"></textarea></div>
          <div class="meta" id="quote">Quote loading…</div>
          <button class="btn" id="buy-btn">Buy now</button>
          <button class="btn secondary" id="cart-btn">Add to cart</button>
        `
        }
        <div id="book-status"></div>
      </aside>
    </div>
  `;

  return {
    html,
    bind(root) {
      root.querySelector('[data-back]').addEventListener('click', () => navigate('/'));
      root.querySelector('#fav-btn').addEventListener('click', () => {
        toggleFavorite(listing);
        root.querySelector('#fav-btn').textContent = isFavorite(listing.id) ? '♥' : '♡';
      });

      const quoteEl = root.querySelector('#quote');
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
          quoteEl.textContent = `Total $${quote.pricing.total.toFixed(2)} (incl. fees & tax)`;
        } catch (err) {
          quoteEl.textContent = err.message;
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
