# CI/CD

## Current

GitHub Actions workflow `.github/workflows/ci.yml` installs `server/`, runs the full Node test suite (API, security, domain, and browser helpers), then `npm audit --omit=dev --audit-level=high`. The browser files in `web/` have no compile step.

Vercel hosts the same app. `vercel.json` copies `web/` into `public/` during the build (the CDN serves that directory). `api/gateway.js` runs the Express app. Rewrites send `/api/*` and `/health` there. Other paths that are not files fall back to `index.html`.

Set these environment variables on the Vercel project before production traffic:

| Variable | Required | Purpose |
|----------|----------|---------|
| `JWT_ACCESS_SECRET` | Yes | Unique secret. Production boot refuses the development placeholder. |
| `SEED_DEMO_USER` | No | Defaults to seeding `demo@bivvy.test`. |
| `DEMO_USER_EMAIL` / `DEMO_USER_PASSWORD` | No | Override the seeded demo account. |

Deploy from a machine that is logged in to Vercel:

```bash
npx vercel deploy --prod
```

Linking the GitHub repo to a Vercel project deploys `main` on each push.

Listings, bookings, and accounts live in process memory. A Vercel function does not keep that memory across cold starts or across instances. Seeded Seattle listings and the demo user are recreated on each instance. Data created in the browser is not durable until a database is added.

## Planned

- Push the Docker image to a registry
- Postgres so marketplace data survives a restart and more than one instance
