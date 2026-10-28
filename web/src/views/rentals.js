import { BookingsApi, ListingsApi, getUser } from '../lib/api.js';
import { navigate } from '../lib/router.js';
import { escapeHtml } from './layout.js';

export async function renderRentals() {
  if (!getUser()) {
    return { html: `<div class="panel">Please <a href="#/login">sign in</a>.</div>`, bind() {} };
  }

  let bookings = [];
  try {
    const data = await BookingsApi.list();
    bookings = data.bookings || [];
  } catch (err) {
    return { html: `<div class="panel error">${escapeHtml(err.message)}</div>`, bind() {} };
  }

  const user = getUser();
  return {
    html: `
      <section class="panel stack">
        <h1 class="page-title">My rentals</h1>
        ${
          bookings.length === 0
            ? '<p class="muted">No bookings yet.</p>'
            : bookings
                .map((b) => {
                  const isOwner = b.ownerId === user.id;
                  const isRenter = b.renterId === user.id;
                  return `
              <article class="panel stack" data-booking="${b.id}">
                <div class="list-row flat">
                  <div>
                    <strong>${escapeHtml(b.listing?.title || b.listingId)}</strong>
                    <div class="meta">${b.status.toUpperCase()} · ${b.startDate} → ${b.endDate} · $${Number(b.pricing?.total || 0).toFixed(2)}</div>
                    <div class="meta">${escapeHtml(b.message || '')}</div>
                  </div>
                </div>
                <div class="action-row" id="actions-${b.id}">
                  ${isOwner && b.status === 'requested' ? `<button class="btn" type="button" data-act="accepted">Accept</button><button class="btn danger" type="button" data-act="declined">Decline</button>` : ''}
                  ${isRenter && b.status === 'requested' ? `<button class="btn secondary" type="button" data-act="cancelled">Cancel</button>` : ''}
                  ${isRenter && b.status === 'accepted' ? `<button class="btn gold" type="button" data-pay>Pay now</button>` : ''}
                  ${isOwner && (b.status === 'accepted' || b.status === 'paid') ? `<button class="btn" type="button" data-act="completed">Mark completed</button>` : ''}
                  ${isRenter && b.status === 'completed' ? `<button class="btn secondary" type="button" data-review>Leave review</button>` : ''}
                  <button class="btn secondary" type="button" data-chat>Messages</button>
                </div>
                <form class="review-form stack" id="review-${b.id}" hidden>
                  <div class="field">
                    <label for="rating-${b.id}">Rating</label>
                    <select id="rating-${b.id}">
                      <option value="5">5 — Excellent</option>
                      <option value="4">4 — Good</option>
                      <option value="3">3 — Okay</option>
                      <option value="2">2 — Poor</option>
                      <option value="1">1 — Bad</option>
                    </select>
                  </div>
                  <div class="field">
                    <label for="comment-${b.id}">Comment</label>
                    <textarea id="comment-${b.id}" rows="3" placeholder="How was the gear?"></textarea>
                  </div>
                  <button class="btn" type="submit">Submit review</button>
                </form>
                <div class="chat" id="chat-${b.id}" hidden></div>
                <div class="search-row composer" id="composer-${b.id}" hidden>
                  <input placeholder="Write a message…" id="input-${b.id}" enterkeyhint="send" autocomplete="off" />
                  <button class="btn" type="button" data-send>Send</button>
                </div>
                <div id="status-${b.id}"></div>
              </article>`;
                })
                .join('')
        }
      </section>
    `,
    bind(root) {
      bookings.forEach((booking) => {
        const card = root.querySelector(`[data-booking="${booking.id}"]`);
        if (!card) return;
        const statusEl = card.querySelector(`#status-${booking.id}`);

        card.querySelectorAll('[data-act]').forEach((btn) => {
          btn.addEventListener('click', async () => {
            try {
              await BookingsApi.updateStatus(booking.id, btn.dataset.act);
              navigate('/rentals');
            } catch (err) {
              statusEl.innerHTML = `<span class="error">${escapeHtml(err.message)}</span>`;
            }
          });
        });

        card.querySelector('[data-pay]')?.addEventListener('click', async () => {
          try {
            await BookingsApi.checkout(booking.id);
            navigate('/rentals');
          } catch (err) {
            statusEl.innerHTML = `<span class="error">${escapeHtml(err.message)}</span>`;
          }
        });

        const reviewForm = card.querySelector(`#review-${booking.id}`);
        card.querySelector('[data-review]')?.addEventListener('click', () => {
          reviewForm.hidden = !reviewForm.hidden;
        });
        reviewForm?.addEventListener('submit', async (event) => {
          event.preventDefault();
          const rating = Number(card.querySelector(`#rating-${booking.id}`).value);
          const comment = card.querySelector(`#comment-${booking.id}`).value;
          try {
            await ListingsApi.review(booking.listingId, {
              bookingId: booking.id,
              rating,
              comment,
            });
            reviewForm.hidden = true;
            statusEl.innerHTML = '<span class="success">Review submitted.</span>';
          } catch (err) {
            statusEl.innerHTML = `<span class="error">${escapeHtml(err.message)}</span>`;
          }
        });

        const chat = card.querySelector(`#chat-${booking.id}`);
        const composer = card.querySelector(`#composer-${booking.id}`);
        card.querySelector('[data-chat]')?.addEventListener('click', async () => {
          chat.hidden = !chat.hidden;
          composer.hidden = chat.hidden;
          if (!chat.hidden) {
            const data = await BookingsApi.messages(booking.id);
            chat.innerHTML = (data.messages || [])
              .map(
                (m) =>
                  `<div class="bubble ${m.senderId === user.id ? 'mine' : ''}"><strong>${escapeHtml(m.senderName)}</strong><div>${escapeHtml(m.body)}</div></div>`,
              )
              .join('');
          }
        });

        card.querySelector('[data-send]')?.addEventListener('click', async () => {
          const input = card.querySelector(`#input-${booking.id}`);
          try {
            await BookingsApi.postMessage(booking.id, input.value);
            input.value = '';
            const data = await BookingsApi.messages(booking.id);
            chat.innerHTML = (data.messages || [])
              .map(
                (m) =>
                  `<div class="bubble ${m.senderId === user.id ? 'mine' : ''}"><strong>${escapeHtml(m.senderName)}</strong><div>${escapeHtml(m.body)}</div></div>`,
              )
              .join('');
          } catch (err) {
            statusEl.innerHTML = `<span class="error">${escapeHtml(err.message)}</span>`;
          }
        });
      });
    },
  };
}
