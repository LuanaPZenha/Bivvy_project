import { ListingsApi, getUser } from '../lib/api.js';
import { navigate } from '../lib/router.js';
import { escapeHtml } from './layout.js';
import { priceLabel } from '../lib/store.js';

export async function renderMyListings() {
  if (!getUser()) {
    return { html: `<div class="panel">Please <a href="#/login">sign in</a>.</div>`, bind() {} };
  }

  let listings = [];
  try {
    const data = await ListingsApi.mine();
    listings = data.listings || [];
  } catch (err) {
    return { html: `<div class="panel error">${escapeHtml(err.message)}</div>`, bind() {} };
  }

  return {
    html: `
      <section class="split">
        <div class="panel stack">
          <h1 class="page-title">My listings</h1>
          ${
            listings.length === 0
              ? '<p class="muted">No listings yet.</p>'
              : listings
                  .map(
                    (l) => `
              <div class="list-row">
                <div>
                  <strong>${escapeHtml(l.title)}</strong>
                  <div class="meta">${l.mode} · ${priceLabel(l)} · ${escapeHtml(l.location || '')}</div>
                  <div class="meta">Blocked: ${(l.blockedDates || []).join(', ') || 'none'}</div>
                </div>
                <div class="action-row">
                  <button class="btn secondary" type="button" data-edit="${l.id}">Edit</button>
                  <button class="btn danger" type="button" data-del="${l.id}">Delete</button>
                </div>
              </div>`,
                  )
                  .join('')
          }
        </div>
        <form class="panel stack" id="listing-form">
          <h2 class="section-title" id="form-title">New listing</h2>
          <input type="hidden" id="edit-id" />
          <div class="field"><label>Title</label><input id="title" required /></div>
          <div class="field"><label>Mode</label>
            <select id="mode"><option value="rent">Rent</option><option value="buy">Buy</option></select>
          </div>
          <div class="field"><label>Category</label>
            <select id="category">
              <option>camping</option><option>hiking</option><option>climbing</option>
              <option>water</option><option>snow</option><option>bikes</option>
            </select>
          </div>
          <div class="field"><label>Price</label><input id="price" type="number" min="0" step="1" /></div>
          <div class="field"><label>ZIP</label><input id="zip" value="98103" /></div>
          <div class="field"><label>Blocked dates (comma YYYY-MM-DD)</label><input id="blocked" placeholder="2026-11-01,2026-11-02" /></div>
          <div class="field"><label>Description</label><textarea id="description" rows="4"></textarea></div>
          <button class="btn gold" type="submit">Save listing</button>
          <div id="status"></div>
        </form>
      </section>
    `,
    bind(root) {
      const form = root.querySelector('#listing-form');
      const status = root.querySelector('#status');

      function fill(listing) {
        root.querySelector('#edit-id').value = listing?.id || '';
        root.querySelector('#form-title').textContent = listing ? 'Edit listing' : 'New listing';
        root.querySelector('#title').value = listing?.title || '';
        root.querySelector('#mode').value = listing?.mode || 'rent';
        root.querySelector('#category').value = listing?.category || 'camping';
        root.querySelector('#price').value =
          listing?.mode === 'buy' ? listing?.buyPrice || '' : listing?.pricePerDay || '';
        root.querySelector('#zip').value = listing?.zipCode || '98103';
        root.querySelector('#blocked').value = (listing?.blockedDates || []).join(',');
        root.querySelector('#description').value = listing?.description || '';
      }

      root.querySelectorAll('[data-edit]').forEach((btn) => {
        btn.addEventListener('click', () => {
          fill(listings.find((l) => l.id === btn.dataset.edit));
          root.querySelector('#listing-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      });

      root.querySelectorAll('[data-del]').forEach((btn) => {
        btn.addEventListener('click', async () => {
          if (!confirm('Delete this listing?')) return;
          try {
            await ListingsApi.remove(btn.dataset.del);
            navigate('/listings');
          } catch (err) {
            alert(err.message);
          }
        });
      });

      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const mode = root.querySelector('#mode').value;
        const price = Number(root.querySelector('#price').value);
        const blocked = root
          .querySelector('#blocked')
          .value.split(',')
          .map((s) => s.trim())
          .filter(Boolean);
        const payload = {
          title: root.querySelector('#title').value,
          mode,
          category: root.querySelector('#category').value,
          zipCode: root.querySelector('#zip').value,
          description: root.querySelector('#description').value,
          blockedDates: blocked,
          ...(mode === 'rent' ? { pricePerDay: price } : { buyPrice: price }),
        };
        status.textContent = 'Saving…';
        try {
          const editId = root.querySelector('#edit-id').value;
          if (editId) await ListingsApi.update(editId, payload);
          else await ListingsApi.create(payload);
          navigate('/listings');
        } catch (err) {
          status.innerHTML = `<span class="error">${escapeHtml(err.message)}</span>`;
        }
      });
    },
  };
}
