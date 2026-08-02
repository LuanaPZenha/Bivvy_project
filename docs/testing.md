# Testing

Testing strategy for Bivvy’s independently versioned packages.

## Requirements (mandatory)

| Layer | Tooling | What must exist |
|-------|---------|-----------------|
| Auth / Core use cases | Jest unit tests | One suite per critical use case |
| Service HTTP routes | Jest + Supertest | Integration tests hitting `createApp()` |
| Gateway health / edge | Jest + Supertest | At least health + 404 behavior |
| Mobile components & hooks | Jest + React Native Testing Library | Component interaction + hook filtering |

CI runs these jobs **separately** per package. A failing Auth job does not cancel Core’s job start (parallel jobs), but merges should require all green checks.

## How to run

```bash
cd api-gateway && npm test
cd ../auth-service && npm test
cd ../core-service && npm test
cd ../mobile && npm test
```

Useful scripts (each service):

| Script | Purpose |
|--------|---------|
| `npm test` | Full suite |
| `npm run test:unit` | Unit only (Auth/Core) |
| `npm run test:integration` | HTTP integration only |

## Backend layout

```
auth-service/
  tests/
    unit/use-cases/        # Domain application tests
    integration/           # Route tests via Supertest
core-service/
  tests/
    unit/use-cases/
    integration/
api-gateway/
  tests/
    integration/
```

### Unit tests (use cases)

- Depend on **ports** (repositories, hashers, token services), not Express.
- Prefer in-memory fakes / stubs.
- Assert domain rules (e.g. short password rejected, category filter).

### Integration tests (routes)

- Boot the real Express app via `createApp()`.
- Use Supertest; do not require Docker for the bootstrap suite.
- Cover happy paths + important 4xx cases.

## Mobile layout

```
mobile/
  __tests__/
    auth/
    components/
    hooks/
    screens/
```

- Use `@testing-library/react-native`.
- Prefer queries by accessibility label/role (matches production a11y).
- Hook tests use `renderHook` + `act`.
- Screens that call `useSafeAreaInsets` should wrap with `SafeAreaProvider` in tests.

## Writing new tests (checklist)

1. New use case → add `tests/unit/use-cases/<Name>.test.js` in the same PR.
2. New route → add/extend `tests/integration/*.test.js`.
3. New UI component/hook → add `__tests__` coverage for behavior, not implementation details.
4. Update [docs/testing.md](./testing.md) only if the strategy or folders change.

## Current coverage snapshot

| Package | Suites (Bootstrap) |
|---------|--------------------|
| api-gateway | Health + 404 |
| auth-service | Register/Login/Google unit + register/login/demo-seed integration |
| core-service | ListNearYou unit + gear/listings integration |
| mobile | `CategoryChips`, `ModeToggle`, `ListingCard`, `useListings`, `ListingDetailScreen`, `RegisterScreen`, `AuthContext` |

Expand coverage as features land; do not delete the mandatory folders.
