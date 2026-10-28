# Getting Started

## Requirements

- Node.js 20+
- npm

## Setup

```bash
cp .env.example .env
cd server && npm install
cd ../web && npm install
```

## Run locally (two terminals)

```bash
# Terminal 1 — API
cd server && npm run dev

# Terminal 2 — Web
cd web && npm run dev
```

Open http://localhost:5173 (Vite proxies `/api` to `:3000`).

On a phone, use the same Wi-Fi and open the Network URL Vite prints (`npm run dev` binds the LAN). The layout is built for the phone browser: bottom tabs, filter sheet, and a fixed booking bar.

Demo account (seeded): `demo@bivvy.test` / `BivvyDemo123`

## Production-style (API serves built web)

```bash
cd web && npm run build
cd ../server && npm start
```

Open http://localhost:3000

## Docker

```bash
docker compose up --build
```

## Environment

| Variable | Purpose |
|----------|---------|
| `PORT` | API port (default `3000`) |
| `CORS_ORIGIN` | Comma-separated allowed origins |
| `JWT_ACCESS_SECRET` | JWT signing secret |
| `SEED_DEMO_USER` | Seed demo account on boot |
| `DEMO_USER_EMAIL` / `DEMO_USER_PASSWORD` | Demo credentials |
