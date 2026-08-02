# Mobile App Overview

Expo (React Native) client for Bivvy — US English UI for outdoor gear rentals and sales.

| | |
|--|--|
| Package | `bivvy-mobile` |
| Directory | `mobile/` |
| Framework | Expo SDK ~54, React Native 0.81 |
| Status | Marketplace MVP slice (browse, detail, auth, profile) |

## Purpose

Provide the consumer experience: browse nearby gear for **rent or buy**, open listing details, sign in / register, and manage a basic profile. The app talks **only** to the API Gateway (`EXPO_PUBLIC_API_URL`). Auth hits live gateway routes; listings remain mock-backed in this slice.

## Layout

```
mobile/
  App.tsx
  app.json
  src/
    auth/AuthContext.tsx
    navigation/          # Root stack, tabs, explore + auth stacks
    screens/             # Home, ListingDetail, Login, Register, Profile
    components/          # HomeHeader, ModeToggle, CategoryChips, ProBanner, ListingCard, PineLogo
    hooks/useListings.ts
    services/api.ts
    security/            # SecureStore session + pinning hook
    theme/tokens.ts
    types/
  __tests__/
```

## Navigation

| Area | Screens |
|------|---------|
| Explore tab | Home → Listing detail |
| Profile tab | Profile (sign in / sign out) |
| Auth modal | Login, Register |

## Current screens

| Screen | Status | Description |
|--------|--------|-------------|
| Home (Explore) | Current | Forest header, Rent/Buy toggle, categories, Pro banner, Near You list |
| Listing detail | Current | Mode-aware price, owner/rating, description, Coming soon CTA |
| Register (auth entry) | Current | Email/password sign-up with validation, confirm password, show/hide, terms note |
| Login | Current | Email/password sign-in |
| Profile | Current | Guest or signed-in card; stub rows for rentals/saved/listings |

## Data today

- **Listings:** `useListings` filters mock data in `src/types/listing.ts` by mode, category, and query. Wiring the feed to `GET /api/gear/near` is **Planned**.
- **Auth:** tokens + user JSON in SecureStore via `AuthContext`. No `/me` endpoint yet — session restores from stored user when an access token exists.

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
