# Core Service

Gear listings, discovery, quotes, and bookings. Built with DDD + Clean Architecture.

| | |
|--|--|
| Package | `bivvy-core-service` |
| Directory | `core-service/` |
| Default port | `3002` |
| Status | Current (in-memory seed + optional Postgres) |

## Responsibilities

- List nearby gear with category / mode / query / ZIP / distance filters.
- Fetch a listing by id and quote rental/buy pricing.
- Create listings owned by the authenticated user (identity via gateway headers).
- Store listing photos on local disk (`UPLOAD_DIR`) and serve them publicly.
- Accept booking requests with availability checks and price breakdowns.
- Cart checkout that creates buy booking requests for multiple listing ids.
- Simulate checkout for accepted bookings.
- Own the `bivvy_core` database schema (Compose DB + service-level migrate).

## Internal routes (behind gateway)

| Method | Path | Notes |
|--------|------|-------|
| `GET` | `/gear/near` | Public listing feed |
| `GET` | `/gear/:id` | Public listing detail |
| `GET` | `/gear/:id/images` | Public image metadata |
| `GET` | `/gear/:id/images/:imageId` | Public image binary |
| `POST` | `/gear/:id/quote` | Public price quote |
| `POST` | `/listings` | Create listing (`X-User-Id` required) |
| `GET` | `/listings/mine` | Owner's listings |
| `POST` | `/listings/:id/images` | Owner image upload (multipart) |
| `POST` | `/bookings` | Create booking request |
| `GET` | `/bookings` | Caller's bookings |
| `PATCH` | `/bookings/:id` | Status transition |
| `POST` | `/bookings/:id/checkout` | Simulated payment |
| `POST` | `/cart/checkout` | Multi-item buy booking requests |
| `GET` | `/health` | Liveness |

See [Gear & Listings API](../api/gear.md).

## Environment

| Variable | Default | Purpose |
|----------|---------|---------|
| `PORT` | `3002` | Listen port |
| `DATABASE_URL` | Compose URL | Enables Postgres adapters |
| `USE_IN_MEMORY` | unset | Set `1` to force in-memory stores |
| `UPLOAD_DIR` | `./uploads` | Local disk root for listing images |
| `UPLOAD_MAX_BYTES` | `5242880` | Max upload size (5 MB) |
| `UPLOAD_MAX_PER_LISTING` | `5` | Max images per listing |

## Local commands

```bash
cd core-service
npm install
npm test
npm run dev
```
