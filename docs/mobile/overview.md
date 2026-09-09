# Mobile App Overview

Expo (React Native) client for Bivvy — US English UI for outdoor gear rentals and sales.

| | |
|--|--|
| Package | `bivvy-mobile` |
| Directory | `mobile/` |
| Framework | Expo SDK ~54, React Native 0.81 |
| Status | Marketplace MVP (browse, quote, book, own listings, auth) |

## Purpose

Provide the consumer experience: browse nearby gear for **rent or buy**, open listing details, request bookings, manage rentals and owner listings, and sign in / register. The app talks **only** to the API Gateway (`EXPO_PUBLIC_API_URL`).

## Layout

```
mobile/
  App.tsx
  app.json
  src/
    auth/AuthContext.tsx
    navigation/          # Root stack, tabs, explore + auth stacks
    screens/             # Home, ListingDetail, BookingRequest, MyRentals, MyListings, Login, Register, Profile
    components/          # HomeHeader, ModeToggle, CategoryChips, ProBanner, ListingCard, FormField, Checkbox, PasswordStrengthMeter, PineLogo
    data/seattleZips.ts  # ZIP labels for Near You
    utils/validation.ts  # Email/phone/password rules shared by forms
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
| Explore tab | Home → Listing detail → Booking request |
| Profile tab | Profile → My rentals / My listings (root stack) |
| Auth modal | Login, Register |

## Current screens

| Screen | Status | Description |
|--------|--------|-------------|
| Home (Explore) | Current | Forest header, ZIP cycling, Rent/Buy, categories, Pro banner, Near You feed (API with offline mock fallback) |
| Listing detail | Current | Fetches by id (mock fallback); CTA opens Booking request |
| Booking request | Current | Dates + quote + create booking (auth required to submit) |
| My rentals | Current | Owner accept/decline; renter cancel/pay (simulated checkout) |
| My listings | Current | Owner list + create form |
| Register (auth entry) | Current | Full name, email, optional phone, password + strength meter, confirm, terms checkbox, marketing opt-in |
| Login | Current | Email/password sign-in with per-field validation and show/hide (dev demo account: `demo@bivvy.test` / `BivvyDemo123`) |
| Profile | Current | Guest or signed-in card; links to My rentals and My listings |

## Data today

- **Listings:** `useListings` calls `GET /api/gear/near` (debounced). On network failure it filters `MOCK_LISTINGS` and shows an offline banner.
- **Bookings / quotes:** live gateway routes via `mobile/src/services/api.ts` (silent refresh on 401 for authenticated calls).
- **Auth:** tokens + user JSON in SecureStore via `AuthContext`. Session restores from stored user when an access token exists.
- **Google sign-in:** backend route and `GoogleSignInButton` exist, but the button is not rendered in the auth screens yet (**Planned**: enable after Android/iOS OAuth clients are configured).

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
