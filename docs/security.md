# Security

## Current

- Passwords hashed with bcryptjs
- JWT access tokens (`Authorization: Bearer`)
- Helmet + CORS allowlist
- JSON body size limit
- No secrets in the web bundle (only public API base if configured)

## Planned

- Refresh token rotation + Redis/Postgres revoke
- Stripe webhook signature verification
- Rate limiting at the edge
- Schema validation library (Zod/Joi) per route
- TLS termination in production

Never commit `.env`. Use `.env.example` placeholders only.
