# API Overview

**Base URL (local):** `http://localhost:3000`  
**Content-Type:** `application/json`

## Route map

| Prefix | Auth | Purpose |
|--------|------|---------|
| `GET /health` | Public | Liveness |
| `/api/auth/*` | Mixed | Register, login, me |
| `/api/listings/*` | Public reads; JWT for writes / mine | Discovery, detail, quote, owner CRUD, reviews |
| `/api/bookings/*` | JWT | Bookings, checkout, chat |
| `/api/cart/*` | JWT | Multi buy checkout |

See [auth.md](./auth.md) and [marketplace.md](./marketplace.md).
