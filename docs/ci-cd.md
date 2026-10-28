# CI/CD

## Current

GitHub Actions workflow `.github/workflows/ci.yml` installs `server/`, runs the full Node test suite (API, security, domain, and browser helpers), then `npm audit --omit=dev --audit-level=high`. The browser files in `web/` have no build step.

## Planned

- Push Docker image to a registry
- Deploy to a single Node host / container platform
