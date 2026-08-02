# CI/CD

Continuous integration for independently deployable Bivvy packages.

## Pipeline location

`.github/workflows/ci.yml`

## Triggers

- Push to `main` or `develop`
- Pull requests targeting `main` or `develop`

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

## Deployment (Planned)

Not implemented yet. Intended direction:

1. Build & push images per service on merge to `main`.
2. Deploy gateway + services independently (ECS/Kubernetes/Fly/etc.).
3. Inject secrets from a secrets manager — never from git.
4. Run smoke tests against `/health` and a protected route.

## Contributor notes

- Always commit the **service-local** `package-lock.json` after dependency changes.
- Do not reintroduce a root workspace `package.json` unless the team explicitly revisits architecture.
- When changing CI, update this document in the same PR.
