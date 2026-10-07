# Mobile App Overview

Expo (React Native) client for Bivvy — US English UI for outdoor gear rentals and sales.

| | |
|--|--|
| Package | `bivvy-mobile` |
| Directory | `mobile/` |
| Framework | Expo SDK ~54, React Native 0.81 |
| Status | Marketplace MVP (browse, filters, favorites, notifications, photos, cart, quote, book, owner CRUD, auth) |

## Purpose

Provide the consumer experience: browse nearby gear for **rent or buy**, filter by distance/sort, save favorites, open listing details with photos, add buy items to a **cart**, request bookings, manage rentals and owner listings (create/edit/delete + photo upload), and sign in / register. The app talks **only** to the API Gateway (`EXPO_PUBLIC_API_URL`).

## Layout

```
mobile/
  App.tsx
  app.json
  src/
    auth/AuthContext.tsx
    cart/CartContext.tsx          # Persisted buy cart
    favorites/FavoritesContext.tsx
    storage/localStore.ts
    navigation/          # Root stack, tabs, explore + auth stacks
    screens/             # Home, Detail, Booking, Cart, Favorites, Notifications,
                         # MyRentals, MyListings, Login, Register, Profile
    components/          # HomeHeader, FilterSheet, ModeToggle, CategoryChips,
                         # ProBanner, ListingCard, FormField, …
    data/seattleZips.ts
    utils/validation.ts
    utils/listingImages.ts
    hooks/useListings.ts
    services/api.ts
    security/
    theme/tokens.ts
    types/
  __tests__/
```

## Navigation

| Area | Screens |
|------|---------|
| Explore tab | Home → Listing detail → Booking request |
| Profile tab | Profile → Cart / Saved / Notifications / My rentals / My listings |
| Auth modal | Login, Register |
| Root stack | Cart, Favorites, Notifications, MyRentals, MyListings |

## Current screens

| Screen | Status | Description |
|--------|--------|-------------|
| Home (Explore) | Current | Forest header, cart + notifications, ZIP cycling, filters (distance/sort), Rent/Buy, categories, Pro banner stub, Near You feed |
| Listing detail | Current | Photo, save heart, rent CTA or Buy now / Add to cart |
| Booking request | Current | Quick date presets, blocked-date hint, quote + create booking |
| Cart | Current | Persisted buy line items; checkout → purchase requests |
| Favorites | Current | Locally saved gear (device storage) |
| Notifications | Current | Booking activity feed derived from `/api/bookings` |
| My rentals | Current | Listing titles; owner accept/decline/complete; renter cancel/pay |
| My listings | Current | Create / edit / delete + photo upload |
| Register / Login | Current | Email/password + Google button (needs client IDs) |
| Profile | Current | Guest or signed-in; links to cart, saved, notifications, rentals, listings |

## Data today

- **Listings:** `useListings` calls `GET /api/gear/near` with `maxDistance` + `sort`. Offline fallback uses `MOCK_LISTINGS`.
- **Favorites / cart:** persisted via `localStore` (SecureStore native / localStorage web).
- **Bookings / quotes:** live gateway routes; booking list includes listing summaries.
- **Auth:** tokens + user JSON in SecureStore via `AuthContext`.
- **Google sign-in:** needs `EXPO_PUBLIC_GOOGLE_CLIENT_ID` in `mobile/.env`.

## Commands

```bash
cd mobile
npm install
npm test
npx expo start
```

Set the API base when integrating:

```bash
# macOS / Linux
export EXPO_PUBLIC_API_URL=http://<your-lan-ip>:3000

# Windows PowerShell
$env:EXPO_PUBLIC_API_URL = "http://<your-lan-ip>:3000"
```

## Related

- [UI & brand](./ui-and-brand.md)
- [Mobile security](./security.md)
- [API Overview](../api/overview.md)
