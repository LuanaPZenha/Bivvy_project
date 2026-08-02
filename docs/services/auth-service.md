# Auth Service

Authentication and session token issuance for Bivvy. Built with DDD + Clean Architecture.

| | |
|--|--|
| Package | `bivvy-auth-service` |
| Directory | `auth-service/` |
| Default port | `3001` |
| Status | Bootstrap (in-memory persistence) |

## Responsibilities

- Register users with bcrypt-hashed passwords.
- Login and issue access JWT + opaque refresh tokens.
- Rotate refresh tokens.
- Own the `bivvy_auth` database (Compose-ready; adapter Planned).

## Layering

```
auth-service/src/
  domain/
    entities/User.js
    value-objects/Email.js
    repositories/IUserRepository.js
  application/use-cases/
    RegisterUser.js
    LoginUser.js
    RefreshSession.js
  infrastructure/
    persistence/InMemoryUserRepository.js
    security/BcryptPasswordHasher.js
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
| `DATABASE_URL` | Compose URL | Planned Postgres adapter |
| `REDIS_URL` | Compose URL | Planned refresh store |

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
| Integration | `tests/integration/auth.routes.test.js` |

## Planned next steps

1. Postgres `UserRepository` replacing in-memory.
2. Redis-backed refresh token store.
3. Logout / revoke endpoint.
4. Map domain validation errors consistently to HTTP 400.

## Related

- [Auth API](../api/auth.md)
- [Security](../security.md)
