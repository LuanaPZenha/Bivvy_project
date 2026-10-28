# Architecture

## Overview

Bivvy v2 is a **JavaScript monolith**:

```
Browser (web/)  --HTTP JSON-->  Express (server/)  --memory store-->  in-process Maps
```

| Layer | Tech |
|-------|------|
| Web | HTML, CSS, and JavaScript modules served by Express |
| API | Node.js + Express |
| Auth | bcryptjs + JWT |
| Data | In-memory Maps seeded with Seattle listings (Postgres Planned) |

## Request flow

1. The browser loads `web/index.html` and ES modules from the same Express process.
2. The page calls `/api/*` on that origin.
3. JWT `Authorization: Bearer` protects owner and renter actions.
4. Booking lifecycle: `requested → accepted → paid → completed` (or decline/cancel).

## Shape

- One language (JavaScript) end-to-end
- One deployable process
- Marketplace loop in the browser: browse → book → pay → chat → review

## Planned

- Postgres adapters for users/listings/bookings
- Real Stripe PaymentIntents (client secret shape already returned by checkout intent)
- Object storage for listing photos
