# Security

Security controls for Bivvy, aligned with common OWASP API guidance. Treat this as the checklist when adding endpoints or client features.

## Threat model (summary)

| Asset | Risk if exposed | Primary controls |
|-------|-----------------|------------------|
| User passwords | Account takeover | bcrypt (cost ≥ 12), never returned in APIs |
| Access JWT | Impersonation | Short TTL (~15m), HTTPS in prod, gateway verification |
| Refresh tokens | Long-lived session theft | Opaque tokens, hashed at rest, rotation |
| Personal data | Privacy breach | Minimal PII in tokens/logs; sanitization |
| Internal services | Direct attack surface | Not published publicly; gateway is the edge |

## Edge (API Gateway) — Current

Implemented in `api-gateway`:

| Control | Implementation |
|---------|----------------|
| Secure headers | Helmet (`x-powered-by` disabled) |
| CORS | Allowlist via `CORS_ORIGIN` (comma-separated) |
| Rate limiting | `express-rate-limit` (window/max from env) |
| Body size limit | `express.json({ limit: '100kb' })` |
| NoSQL injection hygiene | `express-mongo-sanitize` |
| XSS scrubbing | String scrub on JSON body fields |
| Auth gate | Bearer JWT required for `/api/listings` |
| Cookie stripping | Proxy removes `cookie` header toward Auth |

Auth login has an **additional** stricter rate limit (20 / 15 min) inside `auth-service`.

## Authentication & passwords — Current / Bootstrap

Google Sign-In uses a Google **ID token** verified server-side (`GOOGLE_CLIENT_ID` audience). The mobile app only receives the public Web client ID (`EXPO_PUBLIC_GOOGLE_CLIENT_ID`). Never ship `GOOGLE_CLIENT_SECRET` to the client. OAuth consent stays in **Testing** until verification; only listed test users can sign in.

| Topic | Decision |
|-------|----------|
| Password hashing | bcrypt, `BCRYPT_ROUNDS` default `12` |
| Access token | JWT signed with `JWT_ACCESS_SECRET`, default TTL `15m` |
| Refresh token | Opaque random (`base64url`), HMAC-hashed with `JWT_REFRESH_SECRET` |
| Refresh storage | In-memory `Map` today → **Planned:** Redis via `REDIS_URL` |
| Rotation | Refresh token invalidated on use (`RefreshSession`) |
| Public user DTO | Never includes `passwordHash` |

### Token handling rules

1. Clients send `Authorization: Bearer <accessToken>`.
2. Refresh uses the body field `refreshToken` (not cookies) in the bootstrap API.
3. On logout (**Planned**), revoke refresh server-side.
4. Never log raw tokens or password material.

## Mobile client — Current / Planned

| Control | Status | Location |
|---------|--------|----------|
| SecureStore for tokens | Current | `mobile/src/security/secureCredentials.ts` |
| API base via `EXPO_PUBLIC_API_URL` only | Current | `mobile/src/services/api.ts` |
| No secrets in the app binary | Current | Policy — only public URL |
| Certificate pinning | Planned | Hook in `mobile/src/security/certificatePinning.ts` |

Details: [Mobile Security](./mobile/security.md).

## Secrets management

| Allowed in git | Forbidden in git |
|----------------|------------------|
| `.env.example` (placeholders) | `.env` and `.env.*` |
| Docs with fake examples | Real JWT secrets, DB passwords |
| Public Expo vars (`EXPO_PUBLIC_*`) | Private API keys, service-account JSON |

`.gitignore` blocks env files, PEM/keys, Firebase/Google service files, and credential paths.

## Service exposure

| Service | Host publish (Compose) | Rationale |
|---------|------------------------|-----------|
| api-gateway | `:3000` | Public entry |
| auth-service | none (`expose` only) | Internal |
| core-service | none (`expose` only) | Internal |
| postgres / redis | published for local DX | Lock down in production |

## Input validation

- Email value object rejects invalid formats (`auth-service`).
- Passwords must be ≥ 8 characters on register.
- Gateway and services sanitize string bodies against basic XSS patterns.
- Prefer adding schema validation (e.g. Zod/Joi) per route as features grow — **Planned** hardening.

## Logging & errors

- Production clients receive generic `Internal server error` for unexpected failures.
- Domain/auth errors may return safe messages (`Invalid credentials`, `Email already registered`).
- Do not echo stack traces to clients.

## Production checklist (Planned / required before launch)

- [ ] TLS everywhere (no cleartext API)
- [ ] Rotate JWT secrets via a secrets manager
- [ ] Redis-backed refresh tokens with TTL
- [ ] Postgres adapters replacing in-memory repos
- [ ] Certificate pinning on release builds
- [ ] WAF / cloud rate limits in front of the gateway
- [ ] Structured audit logs for auth events (no secrets)
