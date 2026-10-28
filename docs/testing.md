# Testing

```bash
cd server && npm test
```

Node's built-in runner executes every file in `server/tests/` and `server/tests/unit/`.

| Suite | What it locks |
|-------|----------------|
| `tests/api.test.js` | Health, price sort, register → list → book → pay → chat → complete → review |
| `tests/security.api.test.js` | CSP and nosniff, no static path leak, password policy, role ignored, tampered JWT, IDOR on listings/bookings/chat, auth rate limit |
| `tests/unit/domain.test.js` | Pricing, dates, ZIP distance, booking transitions, listing validation, passwords, text limits, production JWT guard |
| `tests/unit/vercel.test.js` | Trust proxy on Vercel, and demo-user seed on the first request |
| `tests/web.test.js` | `escapeHtml` and price/distance labels used by the browser |

CI (`.github/workflows/ci.yml`) runs `npm test` and `npm audit --omit=dev --audit-level=high`.

Browser walkthrough of explore → listing → sign in on http://localhost:3000 is still useful. A full UI runner is **Planned**.
