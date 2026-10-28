# Security

## Current

- Passwords hashed with bcryptjs
- JWT access tokens (`Authorization: Bearer`)
- Helmet response headers
- JSON body size limit
- Site and API share one origin, so the browser does not send a cross-origin token
- No secrets in `web/`

## Planned

- Refresh token rotation + Redis/Postgres revoke
- Stripe webhook signature verification
- Rate limiting at the edge
- Schema validation library (Zod/Joi) per route
- TLS termination in production

Never commit `.env`. Use `.env.example` placeholders only.
