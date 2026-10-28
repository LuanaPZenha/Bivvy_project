import { CartApi, getUser } from '../lib/api.js';
import { clearCart, getCart, removeFromCart, priceLabel } from '../lib/store.js';
import { navigate } from '../lib/router.js';
import { escapeHtml } from './layout.js';

export function renderCart() {
  const items = getCart();
  const subtotal = items.reduce((s, i) => s + (Number(i.buyPrice) || 0), 0);
  return {
    html: `
      <section class="panel stack">
        <h1 class="page-title">Cart</h1>
        ${
          items.length === 0
            ? '<p class="muted">Your cart is empty.</p>'
            : items
                .map(
                  (item) => `
            <div class="list-row">
              <div>
                <strong>${escapeHtml(item.title)}</strong>
                <div class="meta">${priceLabel(item)}</div>
              </div>
              <button class="btn secondary" type="button" data-remove="${item.id}">Remove</button>
            </div>`,
                )
                .join('')
        }
        <div class="price">Subtotal $${subtotal.toFixed(2)}</div>
        <button class="btn" type="button" id="checkout" ${items.length ? '' : 'disabled'}>Request purchase</button>
        <div id="status"></div>
      </section>
    `,
    bind(root) {
      root.querySelectorAll('[data-remove]').forEach((btn) => {
        btn.addEventListener('click', () => {
          removeFromCart(btn.dataset.remove);
          navigate('/cart');
        });
      });
      root.querySelector('#checkout')?.addEventListener('click', async () => {
        if (!getUser()) {
          navigate('/login');
          return;
        }
        const status = root.querySelector('#status');
        status.textContent = 'Submitting…';
        try {
          await CartApi.checkout(
            getCart().map((i) => i.id),
            'Cart checkout',
          );
          clearCart();
          status.innerHTML = '<span class="success">Purchase requests sent. See Rentals.</span>';
          setTimeout(() => navigate('/rentals'), 700);
        } catch (err) {
          status.innerHTML = `<span class="error">${escapeHtml(err.message)}</span>`;
        }
      });
    },
  };
}
