# Bivvy

Outdoor adventure gear rental & resale marketplace (**English UI**, US market).

**JavaScript only.** One Node.js API and one browser app of plain HTML, CSS, and JavaScript.

## Documentation

**Start here → [docs/README.md](./docs/README.md)**

## Layout

```
server/     Express API (JavaScript)
web/        Browser app (HTML, CSS, JavaScript)
app.js      Vercel entry (exports the Express app)
docs/       Product & API docs (English)
Dockerfile  Production image (API + web)
docker-compose.yml
```

## Quick start

```bash
cp .env.example .env
cd server && npm install && npm test && npm start
```

Open http://localhost:3000 — the same process serves the API and the site.

On a phone on the same Wi-Fi, open `http://<this-machine>:3000`.

Demo login: `demo@bivvy.test` / `BivvyDemo123`

Or:

```bash
docker compose up --build
```

## Vercel

Set `JWT_ACCESS_SECRET` in the Vercel project, then `npx vercel deploy --prod`. Details and the in-memory limit are in [docs/ci-cd.md](./docs/ci-cd.md).

## What shipped

Explore (rent/buy, search, filters), listing detail, booking + simulated pay, cart, favorites, owner listings (create/edit/delete + blocked dates), booking chat, reviews. Phone browsers get a bottom tab bar, a filter sheet, and a thumb-reachable booking bar.
