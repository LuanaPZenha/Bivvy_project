# Architecture

## Overview

Bivvy v2 is a **JavaScript monolith**:

```
Browser (web/)  --HTTP JSON-->  Express (server/)  --memory store-->  in-process Maps
```

| Layer | Path | Responsibility |
|-------|------|----------------|
| Web | `web/` | HTML, CSS, and JavaScript modules. Renders text through `escapeHtml`. |
| HTTP | `server/src/routes/`, `server/src/http/` | Express routes and JSON errors |
| Security | `server/src/security/` | Headers, rate limits, passwords, plain-text limits, JWT checks |
| Domain | `server/src/domain/`, `server/src/services/` | Booking transitions, listing rules, pricing, distance |
| Persistence | `server/src/store/`, `server/src/data/` | In-memory Maps and Seattle seed data (Postgres Planned) |

## Request flow

1. The browser loads `web/index.html` and ES modules from the same Express process.
2. The page calls `/api/*` on that origin.
3. JWT `Authorization: Bearer` protects owner and renter actions.
4. Booking lifecycle: `requested → accepted → paid → completed` (or decline/cancel).

## Security boundary

Routes do not trust request bodies. Listing fields, dates, prices, and text go through `domain/` and `security/` before they touch the store. A booking becomes `paid` only in checkout. See [security.md](./security.md).

## Shape

- One language (JavaScript) end-to-end
- One deployable process
- Marketplace loop in the browser: browse → book → pay → chat → review

## Planned

- Postgres adapters for users/listings/bookings
- Real Stripe PaymentIntents (client secret shape already returned by checkout intent)
- Object storage for listing photos
