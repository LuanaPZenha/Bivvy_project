# API Overview

**Base URL (local):** `http://localhost:3000`  
**Content-Type:** `application/json`

## Route map

| Prefix | Auth | Purpose |
|--------|------|---------|
| `GET /health` | Public | Liveness |
| `/api/auth/*` | Mixed | Register, login, me |
| `/api/gear/*` | Public reads | Discovery, detail, quote, reviews list |
| `/api/listings/*` | JWT for writes / mine | Create/update/delete + reviews write |
| `/api/bookings/*` | JWT | Bookings, checkout, chat |
| `/api/cart/*` | JWT | Multi buy checkout |

See [auth.md](./auth.md) and [marketplace.md](./marketplace.md).
