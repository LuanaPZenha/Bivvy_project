# Auth Service

Authentication and session token issuance for Bivvy. Built with DDD + Clean Architecture.

| | |
|--|--|
| Package | `bivvy-auth-service` |
| Directory | `auth-service/` |
| Default port | `3001` |
| Status | Postgres persistence for users (refresh tokens still in memory) |

## Responsibilities

- Register users with bcrypt-hashed passwords, optional phone, and recorded Terms acceptance.
- Login and issue access JWT + opaque refresh tokens.
- Google Sign-In via ID token verification (find-or-create / account link by email).
- Rotate refresh tokens.
- Own the `bivvy_auth` database (Postgres adapter, schema applied at startup).

## Layering

```
auth-service/src/
  domain/
    entities/User.js
    value-objects/Email.js
    value-objects/Phone.js
    repositories/IUserRepository.js
  application/use-cases/
    RegisterUser.js
    LoginUser.js
    LoginWithGoogle.js
    RefreshSession.js
  infrastructure/
    persistence/InMemoryUserRepository.js
    persistence/PostgresUserRepository.js
    persistence/schema.sql
    security/BcryptPasswordHasher.js
    security/GoogleIdTokenVerifier.js
    security/JwtTokenService.js
  interfaces/http/
    controllers/AuthController.js
    routes/authRoutes.js
  shared/security.js
```

## Internal routes (behind gateway)

| Method | Path | Notes |
|--------|------|-------|
| `POST` | `/auth/register` | Public |
| `POST` | `/auth/login` | Public + stricter rate limit |
| `POST` | `/auth/google` | Public + login rate limit; Google ID token |
| `POST` | `/auth/refresh` | Public with refresh body |
| `GET` | `/health` | Liveness |

Clients should call the **gateway** paths under `/api/auth/*`. See [Auth API](../api/auth.md).

## Environment

| Variable | Default | Purpose |
|----------|---------|---------|
| `PORT` | `3001` | Listen port |
| `JWT_ACCESS_SECRET` | required in prod | Access JWT signing |
| `JWT_REFRESH_SECRET` | required in prod | Refresh token HMAC |
| `JWT_ACCESS_EXPIRES_IN` | `15m` | Access TTL |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | Refresh TTL |
| `BCRYPT_ROUNDS` | `12` | Hash cost |
| `SEED_DEMO_USER` | seeded unless `false` | Disable the dev demo account |
| `DEMO_USER_EMAIL` | `demo@bivvy.test` | Demo account email (non-production) |
| `DEMO_USER_PASSWORD` | `BivvyDemo123` | Demo account password (non-production) |
| `GOOGLE_CLIENT_ID` | — | Web OAuth client ID (ID token audience) |
| `GOOGLE_CLIENT_SECRET` | — | Web OAuth client secret (server-side only; not required for ID token verify) |
| `DATABASE_URL` | Compose URL | Postgres users; unset falls back to in-memory |
| `TEST_DATABASE_URL` | — | Enables the Postgres repository test suite |
| `REDIS_URL` | Compose URL | Planned refresh store |

## Persistence

Users live in Postgres (`bivvy_auth`) when `DATABASE_URL` is set — which Compose always does. On startup the service applies `src/infrastructure/persistence/schema.sql` (idempotent `CREATE TABLE IF NOT EXISTS`) and then seeds the demo account.

| Column | Notes |
|--------|-------|
| `id` | UUID primary key |
| `email` | Unique, case-insensitive (`LOWER(email)` index) |
| `password_hash` | Null for Google-only accounts |
| `name`, `phone` | Phone stored as digits |
| `google_sub` | Unique when present |
| `accepted_terms_at` | Timestamp of Terms acceptance |
| `created_at` | Registration time |

Without `DATABASE_URL` the service falls back to `InMemoryUserRepository`, which is what unit and route tests use. Refresh tokens are still an in-memory map (**Redis planned**), so sessions reset on restart even though accounts persist.

Run the database-backed tests against a real instance:

```bash
TEST_DATABASE_URL=postgresql://bivvy:bivvy@localhost:5432/bivvy_auth npm run test:db
```

## Demo account (development only)

Outside production, startup seeds a ready-to-use account so the mobile app can sign in without registering:

| Field | Value |
|-------|-------|
| Email | `demo@bivvy.test` |
| Password | `BivvyDemo123` |

Override with `DEMO_USER_EMAIL` / `DEMO_USER_PASSWORD`, or disable with `SEED_DEMO_USER=false`. The seed never runs when `NODE_ENV=production`, and these are **not** real credentials.

## Local commands

```bash
cd auth-service
npm install
npm test
npm run dev
```

## Tests

| Type | Location |
|------|----------|
| Unit | `tests/unit/use-cases/` |
| Integration | `tests/integration/auth.routes.test.js`, `demoUser.test.js` |
| Database (opt-in) | `tests/integration/postgresUserRepository.test.js` — needs `TEST_DATABASE_URL` |

## Planned next steps

1. Redis-backed refresh token store.
2. Logout / revoke endpoint.
3. Versioned migrations instead of startup `CREATE TABLE IF NOT EXISTS`.
4. Map domain validation errors consistently to HTTP 400.

## Related

- [Auth API](../api/auth.md)
- [Security](../security.md)
