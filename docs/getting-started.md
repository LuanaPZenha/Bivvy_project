# Getting Started

## Requirements

- Node.js 20+
- npm

## Setup

```bash
cp .env.example .env
cd server && npm install
```

## Run

```bash
cd server && npm test && npm start
```

Open http://localhost:3000. Express serves `web/` (HTML, CSS, and JavaScript modules) and `/api` together.

On a phone on the same Wi-Fi, open `http://<this-machine>:3000`. The layout includes bottom tabs, a filter sheet, and a fixed booking bar.

Demo account (seeded): `demo@bivvy.test` / `BivvyDemo123`

## Vercel

The repo includes `vercel.json` and a root `app.js` entry. Production on Vercel requires `JWT_ACCESS_SECRET` set in the project environment (a long random value, not the development placeholder). See [CI/CD](./ci-cd.md).

Marketplace data is in memory. On Vercel it lasts for the life of that function instance.

## Docker

```bash
docker compose up --build
```

## Environment

| Variable | Purpose |
|----------|---------|
| `PORT` | Listen port (default `3000`) |
| `JWT_ACCESS_SECRET` | JWT signing secret. Must be unique when `NODE_ENV=production` |
| `AUTH_RATE_LIMIT_MAX` | Login/register attempts per IP per window (default 10) |
| `AUTH_RATE_LIMIT_WINDOW_MS` | Rate-limit window in milliseconds (default 900000) |
| `TRUST_PROXY` | Set `true` only behind a trusted reverse proxy. Vercel (`VERCEL=1`) trusts one hop automatically |
| `SEED_DEMO_USER` | Seed demo account on boot |
| `DEMO_USER_EMAIL` / `DEMO_USER_PASSWORD` | Demo credentials |
