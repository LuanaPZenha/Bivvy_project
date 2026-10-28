import { currentPath, onRoute } from './lib/router.js';
import { renderShell, wireShell } from './views/layout.js';
import { renderHome } from './views/home.js';
import { renderListing } from './views/listing.js';
import { renderLogin, renderRegister } from './views/auth.js';
import { renderProfile } from './views/profile.js';
import { renderCart } from './views/cart.js';
import { renderFavorites } from './views/favorites.js';
import { renderRentals } from './views/rentals.js';
import { renderMyListings } from './views/listings.js';

const app = document.getElementById('app');

document.addEventListener('focusin', (event) => {
  if (event.target.matches?.('input, textarea, select')) {
    document.body.classList.add('keyboard-open');
  }
});
document.addEventListener('focusout', () => {
  setTimeout(() => {
    const active = document.activeElement;
    if (!active?.matches?.('input, textarea, select')) {
      document.body.classList.remove('keyboard-open');
    }
  }, 80);
});

async function resolve(path) {
  if (path === '/' || path === '') return renderHome();
  if (path === '/login') return renderLogin();
  if (path === '/register') return renderRegister();
  if (path === '/profile') return renderProfile();
  if (path === '/cart') return renderCart();
  if (path === '/favorites') return renderFavorites();
  if (path === '/rentals') return renderRentals();
  if (path === '/listings') return renderMyListings();
  const listingMatch = /^\/listing\/([^/]+)$/.exec(path);
  if (listingMatch) return renderListing(listingMatch[1]);
  return {
    html: `<div class="panel">Page not found. <a href="#/">Go home</a></div>`,
    bind() {},
  };
}

async function render(path = currentPath()) {
  const view = await resolve(path);
  document.body.classList.toggle('listing-route', path.startsWith('/listing/'));
  document.body.classList.remove('sheet-open', 'keyboard-open');
  app.innerHTML = renderShell(view.html);
  wireShell(app);
  view.bind?.(app.querySelector('#view'));
  window.scrollTo(0, 0);
}

onRoute(render);
render();
