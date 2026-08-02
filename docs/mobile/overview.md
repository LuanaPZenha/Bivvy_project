# Mobile App Overview

Expo (React Native) client for Bivvy — US English UI for outdoor gear rental.

| | |
|--|--|
| Package | `bivvy-mobile` |
| Directory | `mobile/` |
| Framework | Expo SDK ~54, React Native 0.81 |
| Status | Bootstrap (home screen + mock listings) |

## Purpose

Provide the consumer experience: locate pickup area, search/filter gear, browse “Near You” listings, and promote Bivvy Pro. The app talks **only** to the API Gateway (`EXPO_PUBLIC_API_URL`).

## Layout

```
mobile/
  App.tsx
  app.json
  src/
    screens/HomeScreen.tsx
    components/          # HomeHeader, CategoryChips, ProBanner, ListingCard, PineLogo
    hooks/useListings.ts
    services/api.ts
    security/            # SecureStore + pinning hook
    theme/tokens.ts
    types/listing.ts
  __tests__/
    components/
    hooks/
```

## Current screens

| Screen | Status | Description |
|--------|--------|-------------|
| Home | Current | Dark forest header, search, categories, Pro banner, Near You list |

## Data today

`useListings` filters **mock** listings in `src/types/listing.ts` (aligned with Core seed titles). Wiring the home feed to `GET /api/gear/near` is the next integration step (**Planned**).

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
