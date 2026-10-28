# Documentation Guide

1. Product language is **English (US)**.
2. Docs live under `docs/` and must stay synchronized with code.
3. Mark unfinished work **Planned** — never as shipped.
4. Do not document secrets; placeholders only.
5. Bump **Last reviewed** on `docs/README.md` when you make a meaningful docs pass.

| Change | Update |
|--------|--------|
| Structure / new package | `docs/README.md`, `docs/architecture.md` |
| HTTP routes | `docs/api/*.md` + server page |
| Auth / env | `docs/security.md`, `docs/getting-started.md`, `.env.example` |
| Web UI | `docs/web/overview.md` |
| Tests / CI / Docker | `docs/testing.md`, `docs/ci-cd.md` |
