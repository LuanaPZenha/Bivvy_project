-- Auth service schema (bivvy_auth). Applied at startup by PostgresUserRepository.
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  password_hash TEXT,
  name TEXT,
  phone TEXT,
  google_sub TEXT,
  role TEXT NOT NULL DEFAULT 'both' CHECK (role IN ('renter', 'owner', 'both')),
  accepted_terms_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'both';

CREATE UNIQUE INDEX IF NOT EXISTS users_email_key ON users (LOWER(email));
CREATE UNIQUE INDEX IF NOT EXISTS users_google_sub_key ON users (google_sub) WHERE google_sub IS NOT NULL;
