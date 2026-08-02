'use strict';

const bcrypt = require('bcrypt');

const ROUNDS = Number(process.env.BCRYPT_ROUNDS) || 12;

class BcryptPasswordHasher {
  async hash(plain) {
    return bcrypt.hash(plain, ROUNDS);
  }

  async compare(plain, hash) {
    return bcrypt.compare(plain, hash);
  }
}

module.exports = { BcryptPasswordHasher };
