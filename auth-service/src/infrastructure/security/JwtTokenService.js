'use strict';

const crypto = require('crypto');
const jwt = require('jsonwebtoken');

/**
 * Issues short-lived access JWTs and opaque refresh tokens.
 * Refresh tokens are stored hashed in-memory (swap for Redis in production).
 */
class JwtTokenService {
  constructor({
    accessSecret = process.env.JWT_ACCESS_SECRET,
    refreshSecret = process.env.JWT_REFRESH_SECRET,
    accessExpiresIn = process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    store = new Map(),
  } = {}) {
    if (!accessSecret || !refreshSecret) {
      throw new Error('JWT secrets are required');
    }
    this.accessSecret = accessSecret;
    this.refreshSecret = refreshSecret;
    this.accessExpiresIn = accessExpiresIn;
    this.refreshExpiresIn = refreshExpiresIn;
    this.store = store;
  }

  async issuePair(user) {
    const accessToken = jwt.sign({ sub: user.id, email: user.email }, this.accessSecret, {
      expiresIn: this.accessExpiresIn,
    });

    const refreshToken = crypto.randomBytes(48).toString('base64url');
    const hash = this.#hash(refreshToken);
    this.store.set(hash, {
      userId: user.id,
      expiresAt: Date.now() + this.#parseDurationMs(this.refreshExpiresIn),
    });

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: this.accessExpiresIn,
    };
  }

  async rotate(refreshToken) {
    const hash = this.#hash(refreshToken);
    const entry = this.store.get(hash);
    if (!entry || entry.expiresAt < Date.now()) {
      this.store.delete(hash);
      const err = new Error('Invalid refresh token');
      err.status = 401;
      throw err;
    }
    this.store.delete(hash);

    const user = { id: entry.userId, email: entry.email || '' };
    return this.issuePair(user);
  }

  async revoke(refreshToken) {
    this.store.delete(this.#hash(refreshToken));
  }

  #hash(token) {
    return crypto.createHmac('sha256', this.refreshSecret).update(token).digest('hex');
  }

  #parseDurationMs(value) {
    const match = /^(\d+)([smhd])$/.exec(String(value));
    if (!match) return 7 * 24 * 60 * 60 * 1000;
    const n = Number(match[1]);
    const unit = { s: 1000, m: 60000, h: 3600000, d: 86400000 }[match[2]];
    return n * unit;
  }
}

module.exports = { JwtTokenService };
