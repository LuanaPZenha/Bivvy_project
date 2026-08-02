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

1. **Header (forest)** — logo + `BIVVY`, notification bell, “Picking up near **Fremont, Seattle**”, search field, gold filter button.
2. **Rent \| Buy toggle** — filters mock listings by market mode.
3. **Category chips** — `All gear`, `Camping`, `Hiking`, `Climbing`, `Water`, `Snow`, `Bikes`.
4. **Bivvy Pro banner** — insured premium listings CTA + `Upgrade`.
5. **Near You** — listing cards with thumbnail, owner, stars, `$ / day` or buy price, miles; tap opens detail.

## Detail & auth

- Detail CTA labels: **Request rental** / **Buy** (alert: Coming soon).
- Auth copy stays English; errors surface gateway messages when available.
- Google CTA labels: **Sign up with Google** (register, above the form) and **Sign in with Google** (login, below the form).
- Register is the default auth entry; dividers read `or sign up with email`.

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
