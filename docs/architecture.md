# Architecture

## Overview

Bivvy v2 is a **JavaScript monolith**:

```
Browser (web/)  --HTTP JSON-->  Express (server/)  --memory store-->  in-process Maps
```

| Layer | Tech |
|-------|------|
| Web | Vite + vanilla ES modules (no React, no TypeScript) |
| API | Node.js + Express |
| Auth | bcryptjs + JWT |
| Data | In-memory Maps seeded with Seattle listings (Postgres Planned) |

## Request flow

1. SPA loads from Vite (dev) or `web/dist` via Express static (prod).
2. Browser calls `/api/*`.
3. JWT `Authorization: Bearer` protects owner/renter actions.
4. Booking lifecycle: `requested → accepted → paid → completed` (or decline/cancel).

## Why this shape

The previous Expo + gateway + auth-service + core-service layout optimized for mobile polyrepo scale. v2 prioritizes:

- One language (JavaScript) end-to-end
- One deployable unit
- Fast local demo of a full marketplace loop (browse → book → pay → chat → review)

## Planned

- Postgres adapters for users/listings/bookings
- Real Stripe PaymentIntents (client secret shape already returned by checkout intent)
- Object storage for listing photos
