# Auth API

Client-facing auth endpoints exposed via the API Gateway.

Gateway prefix: `/api/auth` → Auth service `/auth`.

## POST `/api/auth/register`

Create a user account and receive tokens.

### Request

```json
{
  "email": "hiker@example.com",
  "password": "StrongPass1!",
  "name": "Alex"
}
```

| Field | Required | Rules |
|-------|----------|-------|
| `email` | Yes | Valid email; stored lowercased |
| `password` | Yes | Minimum 8 characters |
| `name` | No | Defaults to email local-part |

### Responses

**201 Created**

```json
{
  "user": {
    "id": "uuid",
    "email": "hiker@example.com",
    "name": "Alex",
    "createdAt": "2026-08-02T00:00:00.000Z"
  },
  "accessToken": "<jwt>",
  "refreshToken": "<opaque>",
  "tokenType": "Bearer",
  "expiresIn": "15m"
}
```

| Status | Error message | When |
|--------|---------------|------|
| 400 | `Password must be at least 8 characters` | Weak password |
| 400 | `Invalid email` | Malformed email |
| 409 | `Email already registered` | Duplicate email |

---

## POST `/api/auth/login`

Authenticate with email/password.

### Request

```json
{
  "email": "hiker@example.com",
  "password": "StrongPass1!"
}
```

### Responses

**200 OK** — same token envelope as register.

| Status | Error message | When |
|--------|---------------|------|
| 401 | `Invalid credentials` | Unknown user or bad password |
| 429 | `Too many login attempts` | Login rate limit exceeded |

---

## POST `/api/auth/google`

Sign in (or register) with a Google ID token from the mobile/web client.

### Request

```json
{
  "idToken": "<google-id-token>"
}
```

| Field | Required | Rules |
|-------|----------|-------|
| `idToken` | Yes | Google Sign-In ID token; audience must match `GOOGLE_CLIENT_ID` |

### Behavior

1. Verify the ID token with Google (`google-auth-library`).
2. Require a verified email on the Google account.
3. Find an existing user by email, or create a Google-linked user (no password).
4. If an email/password user already exists, link `googleSub` and keep their password hash.
5. Return the same token envelope as login/register.

### Responses

**200 OK** — same token envelope as register/login.

| Status | Error message | When |
|--------|---------------|------|
| 400 | `Google ID token required` | Missing body field |
| 401 | `Invalid Google ID token` | Verification failed |
| 401 | `Google email is not verified` | Google account email unverified |
| 503 | `Google sign-in is not configured` | `GOOGLE_CLIENT_ID` missing on auth-service |
| 429 | `Too many login attempts` | Shared login rate limit |

---

## POST `/api/auth/refresh`

Rotate refresh token and issue a new access/refresh pair.

### Request

```json
{
  "refreshToken": "<opaque-refresh-token>"
}
```

### Responses

**200 OK** — new `accessToken` + `refreshToken` (previous refresh invalidated).

| Status | Error message | When |
|--------|---------------|------|
| 400 | `Refresh token required` | Missing body field |
| 401 | `Invalid refresh token` | Unknown/expired/already used |

---

## Security notes

- Passwords are hashed with bcrypt before persistence.
- `passwordHash` is never returned.
- Refresh tokens are stored hashed (in-memory Map today; Redis Planned).
- Prefer calling these routes **only** through the gateway.

See also: [Auth Service](../services/auth-service.md), [Security](../security.md).
