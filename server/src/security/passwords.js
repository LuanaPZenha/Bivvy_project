'use strict';

const bcrypt = require('bcryptjs');
const { httpError } = require('../http/errors');

const BCRYPT_ROUNDS = 12;

function assertPassword(password) {
  const value = String(password || '');
  if (value.length < 8 || value.length > 72) {
    throw httpError(400, 'Password must be 8 to 72 characters');
  }
  if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) {
    throw httpError(400, 'Password must include a letter and a number');
  }
  return value;
}

function hashPassword(password) {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

function verifyPassword(password, passwordHash) {
  return bcrypt.compare(String(password || ''), passwordHash);
}

module.exports = { BCRYPT_ROUNDS, assertPassword, hashPassword, verifyPassword };
