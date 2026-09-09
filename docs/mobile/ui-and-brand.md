# Mobile UI & Brand

Visual and copy guidelines for the Bivvy Expo app. Product language is **English (US)**.

## Brand

| Element | Value |
|---------|-------|
| Product name | **Bivvy** (never “Cairn”) |
| Wordmark | `BIVVY` in the home header and auth screens |
| Mark | Stylized pine / leaf icon |
| Tone | Outdoors, practical, trustworthy |

## Color tokens

Defined in `mobile/src/theme/tokens.ts`:

| Token | Hex | Usage |
|-------|-----|-------|
| `forest` | `#0B1F17` | Header / dark surfaces / primary CTAs |
| `forestMid` | `#143026` | Pro banner, thumbs |
| `cream` | `#F3EFE6` | Main background |
| `gold` | `#D4A84B` | Accents, Pro title, filter button |
| `ink` | `#121212` | Primary text / active chips |
| `muted` | `#6B7280` | Secondary text |
| `danger` | `#C62828` | Notification badge / form errors |

## Explore composition (Current)

1. **Header (forest)** — logo + `BIVVY`, cart icon (badge), notification bell, “Picking up near **{Seattle ZIP label}**” (tap cycles ZIPs), search field, gold filter button.
2. **Offline banner** — shown when Near You falls back to mock data; tap retries the API.
3. **Rent \| Buy toggle** — filters listings by market mode.
4. **Category chips** — `All gear`, `Camping`, `Hiking`, `Climbing`, `Water`, `Snow`, `Bikes`.
5. **Bivvy Pro banner** — insured premium listings CTA + `Upgrade`.
6. **Near You** — listing cards with photo (or tone placeholder), owner, stars, `$ / day` or buy price, miles; tap opens detail.

## Detail, booking & profile

- Detail CTA labels: **Request rental** / **Buy now** + **Add to cart**.
- Profile rows: **Cart**, **My rentals**, **My listings** (auth required for rentals/listings).
- My listings supports **Add photo**.
- Auth copy stays English; errors surface gateway messages when available.
- Register is the default auth entry (email/password). Google **Continue with Google** is mounted on Login and Register; it needs `EXPO_PUBLIC_GOOGLE_CLIENT_ID` (and native client ids on device).
## Copy examples (English)

- Search placeholder: `Search tents, kayaks, skis...`
- Location: `Picking up near Fremont, Seattle`
- Section: `NEAR YOU`
- Modes: `Rent`, `Buy`
- Pro: `Rent out your premium gear. Insured listings for equipment over $500, priority placement.`
- Auth: `Welcome back`, `Create account`, `Sign in to rent or buy outdoor gear near you.`

When adding UI, keep strings in English and prefer centralizing user-visible copy as the app grows.

## Accessibility

Interactive controls should expose `accessibilityLabel` / roles (chips, mode toggle, search, notifications, CTAs). Prefer testing via those labels in RNTL.
