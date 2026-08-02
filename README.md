# Bivvy

Outdoor adventure gear rental marketplace (US).  
**Separate deployable units** — no npm workspaces / no monorepo package graph.

## Layout

```
mobile/          Expo app
api-gateway/     Public HTTP edge
auth-service/    Auth (DDD)
core-service/    Listings (DDD)
infra/           Postgres init SQL
docker-compose.yml
```

Each of `mobile`, `api-gateway`, `auth-service`, and `core-service` has its **own** `package.json`, dependencies, and tests. See [ARCHITECTURE.md](./ARCHITECTURE.md).

## Quick start

```bash
cp .env.example .env   # never commit .env

# Install & test each service independently
cd api-gateway && npm install && npm test && cd ..
cd auth-service && npm install && npm test && cd ..
cd core-service && npm install && npm test && cd ..
cd mobile && npm install && npm test && cd ..

# Run the stack locally
docker compose up --build
```

- Gateway: `http://localhost:3000`
- Mobile: `cd mobile && npx expo start` (set `EXPO_PUBLIC_API_URL`)

## How services talk

Today: **HTTP** through the API Gateway. Auth/Core stay on the private Docker network.  
Later: optional message broker for async events — documented in ARCHITECTURE.md.
