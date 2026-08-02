# API Gateway

Public HTTP edge for Bivvy. **No domain logic** — only security middleware and reverse proxying.

| | |
|--|--|
| Package | `bivvy-api-gateway` |
| Directory | `api-gateway/` |
| Default port | `3000` |
| Status | Current (Bootstrap) |

## Responsibilities

1. Terminate public client traffic.
2. Enforce Helmet, CORS allowlist, rate limits, body limits, sanitization.
3. Proxy `/api/auth` → Auth Service and `/api/gear` + `/api/listings` → Core Service.
4. Verify JWT for protected routes (`/api/listings`).

## Layout

```
api-gateway/
  src/
    app.js
    server.js
    config/
    middleware/       # security.js, auth.js
    routes/proxy.js
    shared/security.js
  tests/integration/
  Dockerfile
  package.json
```

## Environment

| Variable | Default | Purpose |
|----------|---------|---------|
| `PORT` | `3000` | Listen port |
| `CORS_ORIGIN` | `http://localhost:8081` | Allowed origin(s), comma-separated |
| `AUTH_SERVICE_URL` | `http://localhost:3001` | Auth upstream |
| `CORE_SERVICE_URL` | `http://localhost:3002` | Core upstream |
| `JWT_ACCESS_SECRET` | _(empty)_ | Must match Auth for protected routes |
| `RATE_LIMIT_WINDOW_MS` | `900000` | Rate limit window |
| `RATE_LIMIT_MAX` | `100` | Max requests per window per IP |

## Local commands

```bash
cd api-gateway
npm install
npm test
npm run dev
```

Docker:

```bash
docker build -t bivvy-api-gateway .
```

## Health

`GET /health` → `{ "status": "ok", "service": "api-gateway" }`

## Related

- [API Overview](../api/overview.md)
- [Security](../security.md)
- [Architecture](../architecture.md)
