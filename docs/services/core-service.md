# Core Service

Gear listings and near-you discovery. Built with DDD + Clean Architecture.

| | |
|--|--|
| Package | `bivvy-core-service` |
| Directory | `core-service/` |
| Default port | `3002` |
| Status | Bootstrap (in-memory seed data) |

## Responsibilities

- List nearby gear with category / distance filters.
- Create listings (protected at the gateway).
- Own the `bivvy_core` database (Compose-ready; adapter Planned).

## Layering

```
core-service/src/
  domain/
    entities/Listing.js
    repositories/IListingRepository.js
  application/use-cases/
    ListNearYou.js
    CreateListing.js
  infrastructure/
    persistence/InMemoryListingRepository.js
  interfaces/http/
    controllers/GearController.js
    routes/gearRoutes.js
  shared/security.js
```

## Internal routes (behind gateway)

| Method | Path | Notes |
|--------|------|-------|
| `GET` | `/gear/near` | Public listing feed |
| `POST` | `/listings` | Create listing (gateway requires JWT) |
| `GET` | `/health` | Liveness |

See [Gear & Listings API](../api/gear.md).

## Listing model (Current)

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique id |
| `title` | string | Display title |
| `category` | string | e.g. `camping`, `backpacks`, `water` |
| `pricePerDay` | number | USD per day |
| `distanceMiles` | number | Distance from picker location |
| `rating` | number | Average rating |
| `reviewCount` | number | Number of reviews |
| `ownerName` | string | Owner display name |
| `isPro` | boolean | Bivvy Pro listing badge |
| `location` | string | Location label |

## Environment

| Variable | Default | Purpose |
|----------|---------|---------|
| `PORT` | `3002` | Listen port |
| `DATABASE_URL` | Compose URL | Planned Postgres adapter |
| `JWT_ACCESS_SECRET` | — | Reserved for service-level JWT checks (gateway currently enforces) |

## Local commands

```bash
cd core-service
npm install
npm test
npm run dev
```

## Tests

| Type | Location |
|------|----------|
| Unit | `tests/unit/use-cases/ListNearYou.test.js` |
| Integration | `tests/integration/gear.routes.test.js` |

## Planned next steps

1. Postgres listing repository.
2. Geo queries based on real pickup coordinates.
3. Search endpoint used by the mobile search bar.
4. Booking / availability domain (future service or bounded context).

## Related

- [Gear API](../api/gear.md)
- [Mobile overview](../mobile/overview.md)
