# Web app

| | |
|--|--|
| Package | `bivvy-web` |
| Directory | `web/` |
| Stack | Vite + vanilla JavaScript (ES modules) |
| Status | Current |

Hash-router SPA: Explore, listing detail, auth, profile, cart, favorites, rentals (pay/chat/review), my listings.

## Phone browsers

The same site is laid out for a phone browser (no install, no native app):

- Sticky header and a bottom tab bar (Explore, Saved, Cart, Trips, You) under 800px, with safe-area insets.
- Category chips scroll sideways. Filters open as a bottom sheet.
- Listing price and the primary action stay in a thumb-reachable bar.
- Inputs are 16px so mobile browsers do not zoom the page on focus.
- Reviews and sign-in use on-page forms (the phone keyboard submits them).

`npm run dev` listens on the LAN (`host: true`). On a phone on the same network, open the Vite URL printed in the terminal, or the production URL on port 3000 after `npm run build`.

## Commands

```bash
cd web
npm install
npm run dev      # http://localhost:5173
npm run build    # outputs dist/ for Express static
```

Brand tokens live in `web/src/styles.css` (forest / cream / gold). Product UI strings are English (US).
