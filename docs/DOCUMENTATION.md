# Documentation Guide

How we keep Bivvy docs accurate as the product evolves.

## Principles

1. **Docs ship with code.** If a PR changes behavior, routes, env vars, security, or UI, it updates the relevant file under `docs/`.
2. **English only.** Product UI, API messages intended for clients, and documentation are written in English (US).
3. **One source of truth.** Prefer updating an existing page over creating duplicates. Link between pages instead of copying large sections.
4. **Be precise.** Document what exists today. Mark future work clearly as **Planned** — never present planned work as current.
5. **Hide secrets.** Never document real credentials, tokens, or private keys. Use placeholders from `.env.example`.

## What to update (checklist)

| If you change… | Update… |
|----------------|---------|
| Folder / service structure | `docs/README.md`, `docs/architecture.md` |
| HTTP routes or payloads | `docs/api/*.md` + matching `docs/services/*.md` |
| Auth / JWT / password rules | `docs/security.md`, `docs/api/auth.md`, `docs/services/auth-service.md` |
| Mobile screens, brand, copy | `docs/mobile/overview.md`, `docs/mobile/ui-and-brand.md` |
| SecureStore / pinning | `docs/mobile/security.md`, `docs/security.md` |
| Jest / test layout | `docs/testing.md` |
| GitHub Actions / Docker | `docs/ci-cd.md`, `docs/getting-started.md` |
| Env vars | `.env.example` + `docs/getting-started.md` |

Also bump the **Last reviewed** date at the top of `docs/README.md` when you make a meaningful docs pass.

## Document structure conventions

- Start each page with a short purpose statement (1–2 sentences).
- Use tables for contracts (env vars, endpoints, status codes).
- Use fenced code blocks for request/response examples.
- Prefer absolute repo-relative links like `[Architecture](./architecture.md)`.
- Keep root `README.md` short; deep content lives under `docs/`.
- Root `ARCHITECTURE.md` is a pointer to `docs/architecture.md` (do not fork content).

## Status labels

Use these consistently:

- **Current** — implemented and intended for use
- **Bootstrap** — scaffolding that works but uses temporary adapters (e.g. in-memory DB)
- **Planned** — agreed direction, not implemented yet
- **Deprecated** — still present but must not be used for new work

## Review expectation

Before merging a feature:

1. Grep `docs/` for outdated names, ports, or paths you changed.
2. Ensure API examples still match controllers/routes.
3. Ensure security claims still match middleware and mobile storage code.
