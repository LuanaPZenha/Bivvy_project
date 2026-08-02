# API Overview

All **public** HTTP traffic goes through the API Gateway. Mobile and third parties must not call Auth or Core directly in deployed environments.

**Base URL (local):** `http://localhost:3000`  
**Base URL (prod):** Planned (`https://api.bivvy.com` or similar)

## Conventions

| Topic | Convention |
|-------|------------|
| Format | JSON request/response (`Content-Type: application/json`) |
| Auth header | `Authorization: Bearer <accessToken>` |
| Errors | `{ "error": "<message>" }` |
| Success | Resource-specific JSON bodies |
| Language | English messages for client-facing errors |

## Route map (Gateway)

| Method | Public path | Auth required | Upstream |
|--------|-------------|---------------|----------|
| `GET` | `/health` | No | Gateway itself |
| `POST` | `/api/auth/register` | No | Auth `/auth/register` |
| `POST` | `/api/auth/login` | No | Auth `/auth/login` |
| `POST` | `/api/auth/refresh` | No* | Auth `/auth/refresh` |
| `GET` | `/api/gear/near` | No | Core `/gear/near` |
| `POST` | `/api/listings` | **Yes** | Core `/listings` |

\*Refresh does not use the access token; it requires a valid `refreshToken` in the body.

## Detailed references

- [Auth API](./auth.md)
- [Gear & Listings API](./gear.md)

## Versioning

**Current:** unversioned paths (`/api/...`).  
**Planned:** introduce `/api/v1/...` before external partners integrate.

## Idempotency & pagination

Not implemented yet (Planned for listing feeds and booking writes).
