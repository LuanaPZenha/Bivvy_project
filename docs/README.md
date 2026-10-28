# Bivvy Documentation

> Product language: **English** (US market).  
> Last reviewed: **2026-10-27**

Bivvy is an outdoor adventure gear rental and resale **web marketplace** in **JavaScript** (Node API + browser pages).

## Read in this order

| # | Document | Audience |
|---|----------|----------|
| 1 | [Getting Started](./getting-started.md) | Anyone setting up the project |
| 2 | [Architecture](./architecture.md) | Engineers joining the codebase |
| 3 | [API Overview](./api/overview.md) | Frontend & API integrators |
| 4 | [Security](./security.md) | Everyone shipping features |
| 5 | [Testing](./testing.md) | Contributors writing code |
| 6 | [CI/CD](./ci-cd.md) | Anyone changing pipelines |
| 7 | [Documentation Guide](./DOCUMENTATION.md) | Anyone changing the product |

## Component docs

| Component | Doc |
|-----------|-----|
| Server API | [server/overview.md](./server/overview.md) |
| Web app | [web/overview.md](./web/overview.md) |
| Auth API | [api/auth.md](./api/auth.md) |
| Listings & bookings API | [api/marketplace.md](./api/marketplace.md) |

## Repository layout

```
/
├── docs/
├── server/          Express API (JavaScript)
├── web/             Browser app (HTML, CSS, JavaScript)
├── Dockerfile
└── docker-compose.yml
```

One server process owns the site, auth, listings, bookings, cart, chat, and reviews.

## Status snapshot

| Area | Status |
|------|--------|
| Web explore / detail / auth | Current |
| Bookings + simulated checkout (`bivvy_sim`) | Current (`requested → accepted → paid → completed`) |
| Cart (buy requests) | Current |
| Owner listings CRUD + blocked dates | Current |
| Booking chat | Current |
| Reviews after completion | Current |
| Favorites (browser localStorage) | Current |
| Real Stripe charges | Planned (intent shape is Stripe-ready) |
| Postgres persistence | Planned (in-memory store today) |

When you change behavior, update the matching docs in the same change. See [DOCUMENTATION.md](./DOCUMENTATION.md).
