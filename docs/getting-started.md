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

## Docker

```bash
docker compose up --build
```

## Environment

| Variable | Purpose |
|----------|---------|
| `PORT` | Listen port (default `3000`) |
| `JWT_ACCESS_SECRET` | JWT signing secret |
| `SEED_DEMO_USER` | Seed demo account on boot |
| `DEMO_USER_EMAIL` / `DEMO_USER_PASSWORD` | Demo credentials |
