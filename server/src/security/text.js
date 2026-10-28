'use strict';

const { httpError } = require('../http/errors');

function plain(value, max) {
  const text = String(value ?? '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim();
  if (text.length > max) throw httpError(400, `Text exceeds ${max} characters`);
  return text;
}

function emailAddress(value) {
  const email = plain(value, 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw httpError(400, 'Enter a valid email address');
  }
  return email;
}

function money(value, label) {
  const amount = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(amount) || amount < 0 || amount > 100000) {
    throw httpError(400, `${label} must be a number from 0 to 100000`);
  }
  return Math.round(amount * 100) / 100;
}

function isoDate(value, label) {
  const date = String(value || '');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw httpError(400, `${label} must be YYYY-MM-DD`);
  }
  const parsed = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) {
    throw httpError(400, `${label} is not a real calendar date`);
  }
  return date;
}

module.exports = { plain, emailAddress, money, isoDate };
