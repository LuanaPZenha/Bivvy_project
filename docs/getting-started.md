# Getting Started

Set up Bivvy locally for development. Each service is independent — install and run them on their own, or use Docker Compose for the full stack.

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | ≥ 20 |
| npm | ≥ 10 (comes with Node) |
| Docker Desktop | Recent stable (for Compose) |
| Git | Any recent version |
| Expo Go / emulator | Optional, for mobile |

## 1. Clone and configure secrets

```bash
git clone https://github.com/LuanaPZenha/Bivvy_project.git
cd Bivvy_project

cp .env.example .env
```

Edit `.env` and replace placeholder secrets. **Never commit `.env`.**

| Variable | Purpose |
|----------|---------|
| `POSTGRES_USER` / `POSTGRES_PASSWORD` | Postgres credentials |
| `AUTH_DATABASE_URL` | Auth service DB URL |
| `CORE_DATABASE_URL` | Core service DB URL |
| `REDIS_URL` | Refresh-token store (Compose) |
| `JWT_ACCESS_SECRET` | Access token signing secret |
| `JWT_REFRESH_SECRET` | Refresh token HMAC secret |
| `CORS_ORIGIN` | Allowed browser/mobile origin(s), comma-separated |
| `EXPO_PUBLIC_API_URL` | Mobile public API base (gateway only) |

Generate strong JWT secrets, for example:

```bash
openssl rand -base64 64
```

## 2. Install each project independently

There is **no** root `npm install`.

```bash
cd api-gateway && npm install && cd ..
cd auth-service && npm install && cd ..
cd core-service && npm install && cd ..
cd mobile && npm install && cd ..
```

## 3. Run tests (recommended before coding)

```bash
cd api-gateway && npm test && cd ..
cd auth-service && npm test && cd ..
cd core-service && npm test && cd ..
cd mobile && npm test && cd ..
```

Auth tests require JWT secrets in the environment (defaults exist for local test if unset; CI sets them explicitly).

## 4. Start the backend stack (Docker)

From the repository root:

```bash
docker compose up --build
```

| Endpoint | URL |
|----------|-----|
| API Gateway (public) | `http://localhost:3000` |
| Health | `GET http://localhost:3000/health` |
| Auth (internal only) | container `:3001` — not published to host by default |
| Core (internal only) | container `:3002` — not published to host by default |
| Postgres | `localhost:5432` |
| Redis | `localhost:6379` |

> **Note (Bootstrap):** Auth and Core currently use **in-memory** repositories for speed of scaffolding. Compose already provisions Postgres/Redis for the next persistence iteration.

## 5. Start the mobile app

```bash
cd mobile
# optional: export EXPO_PUBLIC_API_URL=http://localhost:3000
npx expo start
```

Use a device/emulator that can reach your machine’s gateway URL (LAN IP instead of `localhost` when testing on a physical phone).

## 6. Smoke-check the API

```bash
curl http://localhost:3000/health
```

Expected:

```json
{ "status": "ok", "service": "api-gateway" }
```

Register a user via the gateway:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"hiker@example.com\",\"password\":\"StrongPass1!\",\"name\":\"Alex\"}"
```

List nearby gear (public):

```bash
curl "http://localhost:3000/api/gear/near"
```

## Common issues

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| CORS errors from Expo web | `CORS_ORIGIN` mismatch | Align with the Expo origin |
| `Auth misconfigured` / 500 on protected routes | Missing `JWT_ACCESS_SECRET` on gateway | Set the same secret used by Auth |
| Phone cannot reach API | `localhost` on device | Use your computer’s LAN IP in `EXPO_PUBLIC_API_URL` |
| `npm ci` fails in CI | Lockfile out of sync | Run `npm install` inside that service and commit its `package-lock.json` |

## Next reading

- [Architecture](./architecture.md)
- [API Overview](./api/overview.md)
- [Security](./security.md)
