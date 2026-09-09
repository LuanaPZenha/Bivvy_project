'use strict';

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const { User } = require('../../domain/entities/User');

const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

function toUser(row) {
  if (!row) return null;
  return new User({
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash,
    name: row.name,
    phone: row.phone,
    googleSub: row.google_sub,
    role: row.role || 'both',
    acceptedTermsAt: row.accepted_terms_at,
    createdAt: row.created_at,
  });
}

/** Postgres adapter for the user repository port. */
class PostgresUserRepository {
  /**
   * @param {{ connectionString?: string, pool?: import('pg').Pool }} [opts]
   */
  constructor({ connectionString = process.env.DATABASE_URL, pool } = {}) {
    this.pool = pool || new Pool({ connectionString });
  }

  /** Creates the users table when missing. Safe to call repeatedly. */
  async migrate() {
    const sql = fs.readFileSync(SCHEMA_PATH, 'utf8');
    await this.pool.query(sql);
  }

  async findByEmail(email) {
    const { rows } = await this.pool.query(
      'SELECT * FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1',
      [email],
    );
    return toUser(rows[0]);
  }

  async findById(id) {
    const { rows } = await this.pool.query('SELECT * FROM users WHERE id = $1 LIMIT 1', [id]);
    return toUser(rows[0]);
  }

  async save(user) {
    const entity = user instanceof User ? user : new User(user);
    const { rows } = await this.pool.query(
      `INSERT INTO users (id, email, password_hash, name, phone, google_sub, role, accepted_terms_at, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (id) DO UPDATE SET
         email = EXCLUDED.email,
         password_hash = EXCLUDED.password_hash,
         name = EXCLUDED.name,
         phone = EXCLUDED.phone,
         google_sub = EXCLUDED.google_sub,
         role = EXCLUDED.role,
         accepted_terms_at = EXCLUDED.accepted_terms_at
       RETURNING *`,
      [
        entity.id,
        entity.email,
        entity.passwordHash,
        entity.name,
        entity.phone,
        entity.googleSub,
        entity.role,
        entity.acceptedTermsAt,
        entity.createdAt,
      ],
    );
    return toUser(rows[0]);
  }

  async close() {
    await this.pool.end();
  }
}

module.exports = { PostgresUserRepository };
