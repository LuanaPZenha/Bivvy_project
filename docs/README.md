# Bivvy Documentation

> Product language: **English** (US market).  
> Last reviewed: **2026-08-02**

Bivvy is an outdoor adventure gear rental and resale marketplace. This folder is the **source of truth** for how the system is designed, built, secured, and operated.

## Read in this order

| # | Document | Audience |
|---|----------|----------|
| 1 | [Getting Started](./getting-started.md) | Anyone setting up the project |
| 2 | [Architecture](./architecture.md) | Engineers joining the codebase |
| 3 | [API Overview](./api/overview.md) | Mobile & backend integrators |
| 4 | [Security](./security.md) | Everyone shipping features |
| 5 | [Testing](./testing.md) | Contributors writing code |
| 6 | [CI/CD](./ci-cd.md) | Anyone changing pipelines |
| 7 | [Documentation Guide](./DOCUMENTATION.md) | Anyone changing the product |

## Service & client docs

| Component | Doc |
|-----------|-----|
| API Gateway | [services/api-gateway.md](./services/api-gateway.md) |
| Auth Service | [services/auth-service.md](./services/auth-service.md) |
| Core Service | [services/core-service.md](./services/core-service.md) |
| Mobile (Expo) | [mobile/overview.md](./mobile/overview.md) |
| Auth API | [api/auth.md](./api/auth.md) |
| Gear / Listings API | [api/gear.md](./api/gear.md) |
| Mobile UI & brand | [mobile/ui-and-brand.md](./mobile/ui-and-brand.md) |
| Mobile security | [mobile/security.md](./mobile/security.md) |

## Repository layout (quick map)

```
/
├── docs/                 ← you are here
├── mobile/               Expo app
├── api-gateway/          Public HTTP edge
├── auth-service/         Authentication (DDD)
├── core-service/         Listings & gear (DDD)
├── infra/postgres/       DB bootstrap SQL
├── docker-compose.yml    Local stack only
└── .github/workflows/    Isolated CI per service
```

**Important:** this is **not** an npm monorepo. There is no root `package.json` and no shared workspace package. Each service is independently installable, testable, and deployable.

## Status snapshot

| Area | Status |
|------|--------|
| API Gateway (proxy + edge security) | Bootstrap complete |
| Auth (register / login / refresh) | Bootstrap (in-memory persistence) |
| Core listings (near you / create) | Bootstrap (in-memory seed data) |
| Mobile home UI (Bivvy brand) | Bootstrap (mock listings) |
| Postgres / Redis wiring | Compose ready; services still use in-memory adapters |
| Message broker | Planned (not implemented) |

When you change behavior, update the matching docs in the same change. See [DOCUMENTATION.md](./DOCUMENTATION.md).
