# Mobile UI & Brand

Visual and copy guidelines for the Bivvy Expo app. Product language is **English (US)**.

## Brand

| Element | Value |
|---------|-------|
| Product name | **Bivvy** (never “Cairn”) |
| Wordmark | `BIVVY` in the home header |
| Mark | Stylized pine / leaf icon |
| Tone | Outdoors, practical, trustworthy |

## Color tokens

Defined in `mobile/src/theme/tokens.ts`:

| Token | Hex | Usage |
|-------|-----|-------|
| `forest` | `#0B1F17` | Header / dark surfaces |
| `forestMid` | `#143026` | Pro banner, thumbs |
| `cream` | `#F3EFE6` | Main background |
| `gold` | `#D4A84B` | Accents, Pro title, filter button |
| `ink` | `#121212` | Primary text / active chips |
| `muted` | `#6B7280` | Secondary text |
| `danger` | `#C62828` | Notification badge |

## Home composition (Current)

Matches the approved marketplace mock:

1. **Header (forest)** — logo + `BIVVY`, notification bell, “Picking up near **Fremont, Seattle**”, search field, gold filter button.
2. **Category chips** — `All gear` (active), `Camping`, `Backpacks`, `Water`.
3. **Bivvy Pro banner** — insured premium listings CTA + `Upgrade`.
4. **Near You** — listing cards with thumbnail, owner, stars, `$ / day`, miles.

## Copy examples (English)

- Search placeholder: `Search tents, kayaks, skis...`
- Location: `Picking up near Fremont, Seattle`
- Section: `NEAR YOU`
- Pro: `Rent out your premium gear. Insured listings for equipment over $500, priority placement.`

When adding UI, keep strings in English and prefer centralizing user-visible copy as the app grows.

## Accessibility

Interactive controls should expose `accessibilityLabel` / roles (already used in chips, search, notifications). Prefer testing via those labels in RNTL.
