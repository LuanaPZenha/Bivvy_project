# Mobile Security

Client-side security practices for the Bivvy Expo app.

## Token storage — Current

File: `mobile/src/security/secureCredentials.ts`

| Key | Storage |
|-----|---------|
| Access token | Expo SecureStore (`bivvy_access_token`) |
| Refresh token | Expo SecureStore (`bivvy_refresh_token`) |

Rules:

1. **Never** store tokens in `AsyncStorage`, plain files, or Redux/persist without encryption.
2. Clear both tokens on logout (`clearTokens`).
3. Attach access tokens only via the shared API helper when `auth: true`.

## API client — Current

File: `mobile/src/services/api.ts`

- Base URL from `EXPO_PUBLIC_API_URL` (public config only).
- No private API keys in the mobile bundle.
- All calls should target the **gateway**, not Auth/Core hostnames.

## Certificate pinning — Planned

File: `mobile/src/security/certificatePinning.ts`

Documented hook; `enabled: false` until production HTTPS + release builds (EAS / custom dev client). Expo Go cannot enforce pinning.

Production plan:

1. Pin leaf or intermediate CA for the API host.
2. Ship backup pins + rotation strategy.
3. Enable only in release builds.

## Checklist for new mobile features

- [ ] No secrets in source or `app.json` extras beyond public values
- [ ] Auth headers go through `apiRequest` / SecureStore
- [ ] User-facing errors are safe English strings
- [ ] Update this doc if storage or pinning strategy changes

See also: [Security](../security.md).
