# Bivvy

Outdoor adventure gear rental marketplace for the **US** (English UI).

Independently deployable services — **not** an npm monorepo.

## Documentation

**Start here → [docs/README.md](./docs/README.md)**

| Topic | Link |
|-------|------|
| Getting started | [docs/getting-started.md](./docs/getting-started.md) |
| Architecture | [docs/architecture.md](./docs/architecture.md) |
| API | [docs/api/overview.md](./docs/api/overview.md) |
| Security | [docs/security.md](./docs/security.md) |
| Testing | [docs/testing.md](./docs/testing.md) |
| Keeping docs updated | [docs/DOCUMENTATION.md](./docs/DOCUMENTATION.md) |

## Layout

```
mobile/          Expo app
api-gateway/     Public HTTP edge
auth-service/    Auth (DDD)
core-service/    Listings (DDD)
infra/           Postgres init SQL
docs/            Full documentation (English)
docker-compose.yml
```

## Quick start

```bash
cp .env.example .env   # never commit .env

cd api-gateway && npm install && npm test && cd ..
cd auth-service && npm install && npm test && cd ..
cd core-service && npm install && npm test && cd ..
cd mobile && npm install && npm test && cd ..

docker compose up --build
```

- Gateway: `http://localhost:3000`
- Mobile: `cd mobile && npx expo start`

## Service communication

**Current:** synchronous HTTP through the API Gateway.  
**Planned:** message broker for async domain events (see architecture docs).
