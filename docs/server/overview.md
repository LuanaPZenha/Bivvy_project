# Server

| | |
|--|--|
| Package | `bivvy-server` |
| Directory | `server/` |
| Runtime | Node.js 20+ |
| Status | Current (in-memory) |

## Commands

```bash
cd server
npm install
npm test
npm run dev
```

## Modules

- `src/routes/` — auth, listings, bookings, cart
- `src/security/` — headers, rate limit, passwords, text limits
- `src/domain/` — booking transitions and listing validation
- `src/services/pricing.js` / `geo.js`
- `src/store/memoryStore.js` — process memory
- `src/middleware/auth.js` — JWT (HS256)

Vercel imports the repo-root `app.js`, which calls `createApp({ seedOnRequest: true })`. Local `npm start` still boots `src/index.js`.
