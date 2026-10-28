# Bivvy

Outdoor adventure gear rental & resale marketplace (**English UI**, US market).

**v2 — pure JavaScript.** One Node.js API + one vanilla JS web app. No Expo / React Native mobile app.

## Documentation

**Start here → [docs/README.md](./docs/README.md)**

## Layout

```
server/     Express API (JavaScript)
web/        Vite SPA (vanilla JavaScript)
docs/       Product & API docs (English)
Dockerfile  Production image (API + built web)
docker-compose.yml
```

## Quick start

```bash
cp .env.example .env

# API
cd server && npm install && npm test && npm run dev

# Web (another terminal)
cd web && npm install && npm run dev
```

- Web (Vite): http://localhost:5173  
- API: http://localhost:3000  
- Demo login: `demo@bivvy.test` / `BivvyDemo123`

### Single production process

```bash
cd web && npm install && npm run build && cd ..
cd server && npm install && npm start
# serves API + web/dist on :3000
```

Or:

```bash
docker compose up --build
```

## What shipped

Explore (rent/buy, search, filters), listing detail, booking + simulated pay, cart, favorites, owner listings (create/edit/delete + blocked dates), booking chat, reviews. Phone browsers get a bottom tab bar, a filter sheet, and a thumb-reachable booking bar.
