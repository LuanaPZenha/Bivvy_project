# Security

Controls below map to the OWASP Top 10 (2021) for this JavaScript monolith. Items not built yet stay **Planned**.

## A01 Broken access control — Current

- JWT required for create, update, delete, bookings, cart, and chat
- Listing edits and deletes check `ownerId`
- Booking lists and messages are limited to the renter and the owner
- A member cannot book or buy their own listing
- Status `paid` is set only by checkout, not by a status patch
- Register ignores a client-supplied `role`

## A02 Cryptographic failures — Current

- Passwords hashed with bcrypt (cost 12), never returned in JSON
- JWT signed with HS256 only
- Production boot refuses the built-in development JWT secret
- Demo password is not written to the log

## A03 Injection — Current

- JSON body limit 100kb
- Email, ZIP, prices, dates, and text length are validated before storage
- Control characters are stripped from text
- The browser escapes HTML before inserting it into the page
- No user-controlled URLs are fetched by the server (SSRF, A10, is not applicable)

## A04 Insecure design — Current

- Login and register are rate limited per IP (default 10 requests / 15 minutes)
- Passwords must be 8–72 characters and include a letter and a number
- Login failures use one message for unknown email and bad password

## A05 Security misconfiguration — Current

- Helmet sets a Content-Security-Policy (`script-src 'self'`, `frame-ancestors 'none'`, `object-src 'none'`)
- `X-Powered-By` is disabled
- Static files deny dotfiles
- 500 responses do not include stack traces
- `express.static` only serves `web/`

## A07 Identification and authentication failures — Current

- Bearer tokens are verified with an algorithm allow-list
- Tampered tokens are rejected
- Auth endpoints return 429 with `Retry-After` when the limit is exceeded

## A09 Security logging and monitoring failures — Current

- Request logs use morgan outside tests
- Server errors are logged as a message, not returned to the client

## Planned

- Refresh token rotation and server-side revoke
- Real Stripe webhook signature checks
- Persistent audit log
- Dependency review beyond `npm audit` in CI
- TLS termination at the host

Never commit `.env`. Use `.env.example` placeholders only.

Optional environment:

| Variable | Default | Purpose |
|----------|---------|---------|
| `JWT_ACCESS_SECRET` | development placeholder | Required and unique when `NODE_ENV=production` |
| `AUTH_RATE_LIMIT_MAX` | `10` (`1000` when `NODE_ENV=test`) | Login/register attempts per window |
| `AUTH_RATE_LIMIT_WINDOW_MS` | `900000` | Rate-limit window |
| `TRUST_PROXY` | unset | Set `true` only behind a trusted proxy |
