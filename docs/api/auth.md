# Auth API

## POST `/api/auth/register`

```json
{
  "email": "alex@example.com",
  "password": "Password123",
  "name": "Alex",
  "acceptTerms": true
}
```

**201** `{ "accessToken": "…", "user": { "id", "email", "name", "role" } }`

## POST `/api/auth/login`

```json
{ "email": "demo@bivvy.test", "password": "BivvyDemo123" }
```

## GET `/api/auth/me`

Requires `Authorization: Bearer <accessToken>`.
