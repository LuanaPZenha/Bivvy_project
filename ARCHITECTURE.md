# Bivvy Architecture

> Outdoor gear rental marketplace for the US market.  
> Mobile app (React Native / Expo) + Node.js microservices behind an API Gateway.

---

## 1. High-level overview

```
┌─────────────────┐
│  Expo Mobile    │  SecureStore (tokens), HTTPS only
│  (Bivvy app)    │
└────────┬────────┘
         │ HTTPS
         ▼
┌─────────────────┐
│  API Gateway    │  Helmet, CORS, rate limit, sanitization, JWT verify
│  :3000          │  Routes /auth/* → AuthService, /gear|/listings → CoreService
└────┬───────┬────┘
     │ HTTP  │ HTTP
     ▼       ▼
┌─────────┐ ┌──────────┐
│ Auth    │ │ Core     │
│ :3001   │ │ :3002    │
│ (DDD)   │ │ (DDD)    │
└────┬────┘ └────┬─────┘
     │           │
     ▼           ▼
┌─────────┐  ┌─────────┐     ┌───────┐
│ Postgres│  │ Postgres│     │ Redis │
│ auth DB │  │ core DB │     │ refresh│
└─────────┘  └─────────┘     └───────┘
```

**Service communication (current decision):** synchronous **HTTP** via the API Gateway for request/response flows (login, search, list gear). Inter-service calls are internal Docker network only — microservices are **not** exposed publicly except through the gateway.

**Future mensageria:** when we add async domain events (e.g. `ListingCreated`, `BookingConfirmed`, notifications), introduce a message broker (RabbitMQ or AWS SNS/SQS). Until then, keep HTTP to reduce operational complexity.

---

## 2. Technology stack

| Layer | Choice |
|--------|--------|
| Mobile | React Native + Expo |
| Backend | Node.js 20+, Express, TypeScript |
| Gateway | Express reverse-proxy / route forwarding |
| Data | PostgreSQL (per-service DB), Redis (refresh tokens) |
| Containers | Docker + Compose |
| CI/CD | GitHub Actions (lint, test, build images) |
| Tests | Jest + Supertest (backend), Jest + RNTL (mobile) |

---

## 3. Microservices & DDD / Clean Architecture

Each service isolates the **domain** from frameworks and persistence:

```
src/
  domain/           # Entities, value objects, repository ports (no Express/DB)
  application/      # Use cases + DTOs (orchestration)
  infrastructure/   # DB adapters, JWT/bcrypt, external APIs
  interfaces/http/  # Controllers, routes, middlewares
  shared/           # Cross-cutting helpers local to the service
```

### AuthService
- Register / login / logout / refresh token rotation
- Password hashing (bcrypt, high cost factor)
- Access JWT (short-lived) + refresh tokens stored hashed in Redis
- Domain: `User`, `RefreshToken`

### CoreService
- Gear listings, categories, search “near you”, Pro listing flags
- Domain: `Listing`, `Category`, `OwnerProfile`
- Validates access JWT via shared secret (or future JWKS)

### API Gateway
- Single public entry point
- Security middleware stack (OWASP baseline)
- Proxies to Auth / Core; strips internal headers

---

## 4. Security (OWASP-aligned)

### API
- **Helmet** — secure HTTP headers
- **CORS** — allowlist only (`CORS_ORIGIN`)
- **Rate limiting** — per IP (gateway + auth login stricter)
- **Input sanitization** — `express-mongo-sanitize` + XSS scrubbing
- **No secrets in responses** — never return password hashes or refresh raw tokens in logs
- **Internal ports** — Auth/Core only `expose`d, not published to host in production

### Authentication
- Access token: JWT HS256 (or RS256 later), short TTL (~15m)
- Refresh token: opaque, stored hashed, rotated on use, revocable in Redis
- Passwords: bcrypt (cost ≥ 12) — Argon2 optional upgrade path

### Mobile
- Tokens in **Expo SecureStore** (Keychain / Keystore)
- No API secrets in the client — only `EXPO_PUBLIC_API_URL`
- Certificate pinning: planned for production builds (documented hook in `mobile/src/security/`)

Secrets live in `.env` (gitignored). Only `.env.example` is committed.

---

## 5. Testing requirements

| Layer | Tooling | Mandatory |
|--------|---------|-----------|
| Backend use cases | Jest unit tests | Yes — every application use case |
| Backend routes | Jest + Supertest integration | Yes — per microservice |
| Mobile UI | Jest + React Native Testing Library | Components + hooks |

CI fails if unit or integration suites fail.

---

## 6. Repository layout

```
/
├── mobile/                 # Expo app (Bivvy)
├── backend/
│   ├── api-gateway/
│   ├── auth-service/
│   ├── core-service/
│   └── shared/             # Shared types & security helpers (workspace)
├── .github/workflows/      # CI
├── docker-compose.yml
├── ARCHITECTURE.md
└── package.json            # npm workspaces root
```

---

## 7. CI/CD (GitHub Actions)

Pipeline (`.github/workflows/ci.yml`):
1. Install workspaces
2. Lint + Prettier check
3. Run backend unit + integration tests
4. Run mobile tests
5. Build Docker images (no push secrets in PRs)

Deploy stages (staging/prod) will be added when environments exist.

---

## 8. English-first product

UI copy, API error messages for clients, and docs aimed at US users are written in **English**. Internal engineering notes may use PT-BR when collaborating locally.
