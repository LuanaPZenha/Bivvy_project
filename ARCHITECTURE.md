# Bivvy Architecture

> Outdoor gear rental marketplace for the US market.  
> Independently deployable services — **not a monorepo / not npm workspaces**.

---

## 1. Repository layout (poly-service)

Each app/service is a **standalone Node project** with its own `package.json`, lockfile, Dockerfile, and tests. They communicate only over the network (HTTP today).

```
/
├── mobile/              # Expo app (own deps)
├── api-gateway/         # Public edge (own deps)
├── auth-service/        # Auth domain (own deps)
├── core-service/        # Listings domain (own deps)
├── infra/postgres/      # DB bootstrap SQL only
├── docker-compose.yml   # Local orchestration (not a code dependency)
├── ARCHITECTURE.md
└── .github/workflows/   # CI runs each service in isolation
```

There is **no root `package.json`**, no shared workspace package, and no cross-service `require()`.

---

## 2. High-level overview

```
┌─────────────────┐
│  Expo Mobile    │  SecureStore (tokens), HTTPS only
│  (Bivvy app)    │
└────────┬────────┘
         │ HTTPS
         ▼
┌─────────────────┐
│  API Gateway    │  Helmet, CORS, rate limit, sanitization, JWT gate
│  :3000          │  Routes /api/auth → Auth, /api/gear|/listings → Core
└────┬───────┬────┘
     │ HTTP  │ HTTP
     ▼       ▼
┌─────────┐ ┌──────────┐
│ Auth    │ │ Core     │
│ :3001   │ │ :3002    │
└────┬────┘ └────┬─────┘
     ▼           ▼
 Postgres     Postgres (+ Redis for refresh tokens on Auth)
```

**Communication:** synchronous **HTTP** via the API Gateway for request/response. Auth and Core are not publicly exposed (`expose` only on the Docker network).

**Future mensageria:** domain events (e.g. `ListingCreated`) can use RabbitMQ / SNS+SQS later. Until then, keep HTTP.

---

## 3. Independence rules

| Rule | Why |
|------|-----|
| Own `package.json` + lockfile per service | Independent versioning & deploys |
| Own Dockerfile | Build/push without other services |
| No shared npm package in-repo | Avoid accidental coupling |
| Duplicate thin security helpers if needed | Prefer copy over a shared library for now |
| Separate CI jobs | Jobs run in parallel per service |

Security helpers live **inside** each service under `src/shared/security.js` (local to that service, not a published package).

---

## 4. DDD / Clean Architecture (Auth & Core)

```
src/
  domain/           # Entities, value objects, repository ports
  application/      # Use cases + DTOs
  infrastructure/   # DB, JWT/bcrypt adapters
  interfaces/http/  # Controllers, routes
  shared/           # Local cross-cutting (security scrubbers)
```

### Auth Service
- Register / login / refresh
- bcrypt passwords, short-lived JWT + opaque refresh tokens

### Core Service
- Near-you listings, categories, create listing

### API Gateway
- Edge security + reverse proxy only (no domain logic)

---

## 5. Security (OWASP-aligned)

- Helmet, restricted CORS, rate limiting, input sanitization
- JWT access tokens; refresh tokens hashed at rest (Redis in production)
- Mobile: Expo SecureStore; certificate pinning hook for release builds
- Secrets only in `.env` (gitignored); commit `.env.example` only
- Internal services not published on host ports in production

---

## 6. Testing

| Service | Unit (use cases) | Integration (routes) |
|---------|------------------|----------------------|
| auth-service | Jest | Jest + Supertest |
| core-service | Jest | Jest + Supertest |
| api-gateway | — | Jest + Supertest |
| mobile | hooks | RNTL components |

Run inside each folder: `npm test`.

---

## 7. Local orchestration

`docker compose up --build` wires the independent images together for local/dev. Production may deploy each service to its own host/cluster with the same env contract.
