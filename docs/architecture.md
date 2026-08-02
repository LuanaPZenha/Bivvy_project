# Architecture

Bivvy is a **poly-service** system: independently deployable Node.js services behind an API Gateway, plus a React Native (Expo) client. Services do not share an npm workspace or in-process libraries.

## Design goals

1. **Independent deployability** — ship Auth without rebuilding Core (and vice versa).
2. **Domain isolation** — Auth and Core follow DDD + Clean Architecture so the domain does not depend on Express or a specific database.
3. **Secure edge** — all public traffic enters through the API Gateway.
4. **English-first product** — US-facing UI and client API messages are in English.
5. **Observable evolution** — start with HTTP; add messaging only when async workflows require it.

## System context

```
Clients: Expo mobile (Bivvy)
        |  HTTPS (prod) / HTTP (local)
        v
API Gateway :3000
  - Helmet, CORS allowlist, rate limit, sanitization, JWT gate
  - /api/auth     -> Auth Service
  - /api/gear     -> Core Service
  - /api/listings -> Core Service (JWT required)
        |                         |
        v                         v
Auth Service :3001          Core Service :3002
  Users, passwords, JWT       Listings, near-you search
  DDD / Clean Architecture    DDD / Clean Architecture
        |                         |
        v                         v
Postgres bivvy_auth         Postgres bivvy_core
Redis (refresh tokens)      (persistence Planned)
```

## Repository layout

```
/
├── mobile/                 # Expo app — own package.json
├── api-gateway/            # Edge proxy — own package.json
├── auth-service/           # Auth domain — own package.json
├── core-service/           # Listings domain — own package.json
├── infra/postgres/         # Init SQL for Compose only
├── docs/                   # This documentation set
├── docker-compose.yml      # Local orchestration (not a code dep)
└── .github/workflows/ci.yml
```

### Independence rules

| Rule | Rationale |
|------|-----------|
| No root `package.json` | Prevents accidental workspace coupling |
| No shared in-repo npm package | Prefer network contracts over code sharing |
| Own Dockerfile per service | Independent image builds |
| Own CI job per service | Failures stay isolated |
| Local security helpers may be duplicated | Thin copies beat a premature shared library |

## Communication model

### Current — synchronous HTTP

- Mobile → **API Gateway** only.
- Gateway → Auth / Core over the private Docker network.
- Auth and Core ports are `expose`d, not published to the host, in Compose (except Postgres/Redis for local tooling).

Path rewriting at the gateway:

| Public path | Upstream |
|-------------|----------|
| `/api/auth/*` | `auth-service` `/auth/*` |
| `/api/gear/*` | `core-service` `/gear/*` |
| `/api/listings/*` | `core-service` `/listings/*` (JWT required at gateway) |

### Planned — messaging

When we need async workflows (notifications, booking side-effects, search indexing), introduce a broker (RabbitMQ or AWS SNS/SQS) and publish domain events such as `ListingCreated` or `BookingConfirmed`. Until then, **do not** add a broker “just in case.”

## Internal architecture (Auth & Core)

Both domain services use the same layering:

```
src/
  domain/            # Entities, value objects, repository ports (no Express/DB)
  application/       # Use cases orchestrating the domain
  infrastructure/    # Adapters (persistence, bcrypt, JWT)
  interfaces/http/   # Controllers, routes, HTTP middlewares
  shared/            # Service-local helpers (e.g. sanitization)
```

Dependency rule: **inward only**. Domain must not import Express, Helmet, or SQL clients.

### Auth domain (Current / Bootstrap)

| Use case | Responsibility |
|----------|----------------|
| `RegisterUser` | Validate email/password, hash password, persist user, issue tokens |
| `LoginUser` | Verify credentials, issue tokens |
| `RefreshSession` | Rotate refresh token, issue new pair |

Persistence today: **in-memory** `InMemoryUserRepository`. Compose Postgres is ready for the next adapter.

### Core domain (Current / Bootstrap)

| Use case | Responsibility |
|----------|----------------|
| `ListNearYou` | Filter listings by category / distance |
| `CreateListing` | Create a new gear listing |

Persistence today: **in-memory** seed data (`4-Person Blackout Tent`, `60L Alpine Backpack`).

### API Gateway

No domain logic. Responsibilities:

- Apply edge security middleware
- Proxy to upstream services
- Optionally verify JWT before proxying protected routes (`/api/listings`)

## Data ownership

| Data | Owner service | Notes |
|------|---------------|-------|
| Users, password hashes, refresh tokens | Auth | Separate DB `bivvy_auth` |
| Listings, categories, distances | Core | Separate DB `bivvy_core` |
| Mobile tokens at rest | Device SecureStore | Never AsyncStorage for tokens |

**Do not** query another service’s database. Cross-service needs go through HTTP APIs (or future events).

## Configuration

Runtime config is environment-driven. See [Getting Started](./getting-started.md) and `.env.example`.

Critical shared contract: **`JWT_ACCESS_SECRET` must match** between Auth (issuer) and Gateway (verifier for protected routes).

## Related docs

- [API Overview](./api/overview.md)
- [Security](./security.md)
- [API Gateway service](./services/api-gateway.md)
