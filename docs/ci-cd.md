# CI/CD

Continuous integration for independently deployable Bivvy packages, plus a scheduled keep-alive for the Render free-tier deployment.

## Pipeline location

| Workflow | File |
|----------|------|
| CI (tests + Docker builds) | `.github/workflows/ci.yml` |
| Keep Render awake | `.github/workflows/keep-render-awake.yml` |

## Triggers

**CI**

- Push to `main` or `develop`
- Pull requests targeting `main` or `develop`

**Keep Render Awake**

- Cron every 10 minutes (`*/10 * * * *`)
- Manual run via `workflow_dispatch`

## Jobs (parallel, isolated)

| Job | Working directory | Steps |
|-----|-------------------|-------|
| `api-gateway` | `api-gateway/` | `npm ci` → `npm test` → `docker build` |
| `auth-service` | `auth-service/` | `npm ci` → `npm test` → `docker build` |
| `core-service` | `core-service/` | `npm ci` → `npm test` → `docker build` |
| `mobile` | `mobile/` | `npm ci` → `npm test` |

Auth job injects test JWT secrets:

```yaml
JWT_ACCESS_SECRET: ci_test_access_secret_min_32_chars
JWT_REFRESH_SECRET: ci_test_refresh_secret_min_32_chars
```

These are **CI-only** placeholders, not production secrets.

## Caching

Each job caches npm using that package’s `package-lock.json` via `cache-dependency-path`.

## Docker builds in CI

Images are built to prove Dockerfiles remain valid. **Image push to a registry is Planned** (requires registry credentials and environment promotion strategy).

Local builds:

```bash
docker build -t bivvy-api-gateway ./api-gateway
docker build -t bivvy-auth-service ./auth-service
docker build -t bivvy-core-service ./core-service
```

Or: `docker compose up --build`.

## Render deployment (bootstrap)

Public URL: `https://bivvy-project.onrender.com`

Render **Free** web services spin down after ~15 minutes without inbound traffic. The **Keep Render Awake** workflow pings `GET /health` every 10 minutes (with a long timeout for cold starts) so the instance stays warm for demos.

| Setting | Value |
|---------|-------|
| Default health URL | `https://bivvy-project.onrender.com/health` |
| Override | Repository variable `RENDER_HEALTH_URL` (Settings → Variables → Actions) |
| Failure policy | Soft-fail (warning) if status ≠ 200 — cold starts should not fail the Actions tab |

Notes:

- Keeping a Free instance awake consumes [Free instance hours](https://render.com/docs/free) (750/month per workspace).
- GitHub may pause scheduled workflows on inactive repositories after ~60 days; a push or manual run re-enables them.
- Git auto-deploy from the connected Render service (push to the linked branch) is configured in the Render dashboard, not in this repo.

## Full CD (Planned)

Not implemented yet. Intended direction:

1. Build & push images per service on merge to `main`.
2. Deploy gateway + services independently (or promote the Render Blueprint).
3. Inject secrets from a secrets manager — never from git.
4. Run smoke tests against `/health` and a protected route.

## Contributor notes

- Always commit the **service-local** `package-lock.json` after dependency changes.
- Do not reintroduce a root workspace `package.json` unless the team explicitly revisits architecture.
- When changing CI, update this document in the same PR.
