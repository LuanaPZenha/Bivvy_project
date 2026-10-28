# Web app

| | |
|--|--|
| Directory | `web/` |
| Stack | HTML, CSS, JavaScript modules |
| Status | Current |

Hash-router SPA: Explore, listing detail, auth, profile, cart, favorites, rentals (pay/chat/review), my listings.

## Phone browsers

The same site is laid out for a phone browser (no install, no native app):

- Sticky header and a bottom tab bar (Explore, Saved, Cart, Trips, You) under 800px, with safe-area insets.
- Category chips scroll sideways. Filters open as a bottom sheet.
- Listing price and the primary action stay in a thumb-reachable bar.
- Inputs are 16px so mobile browsers do not zoom the page on focus.
- Reviews and sign-in use on-page forms (the phone keyboard submits them).

The site is static files. `web/package.json` only sets `"type": "module"` so Node can import those files in tests. There is no bundler and no runtime dependency. `server` serves the files on port 3000 with the API. On Vercel, the build copies them to `public/` and the CDN serves them. On a phone on the same network, open `http://<this-machine>:3000`.

Brand tokens live in `web/src/styles.css` (forest / cream / gold). The header mark is `web/favicon.svg`: a cream fir and gold trunk on a forest tile. Product UI strings are English (US).
