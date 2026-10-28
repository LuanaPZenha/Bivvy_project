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

- `src/routes/` — auth, listings/gear, bookings, cart
- `src/store/memoryStore.js` — process memory
- `src/services/pricing.js` / `geo.js`
- `src/middleware/auth.js` — JWT
