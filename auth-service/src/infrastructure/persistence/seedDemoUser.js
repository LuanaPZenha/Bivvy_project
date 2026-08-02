'use strict';

const { randomUUID } = require('crypto');
const { User } = require('../../domain/entities/User');

const DEFAULT_EMAIL = 'demo@bivvy.test';
const DEFAULT_PASSWORD = 'BivvyDemo123';
const DEFAULT_NAME = 'Demo Rider';

/**
 * Seeds a demo account so the mobile app can sign in without registering first.
 * Never runs in production: the in-memory store is a bootstrap-only adapter.
 */
async function seedDemoUser({ userRepository, passwordHasher, logger = console }) {
  if (process.env.NODE_ENV === 'production') return null;
  if (process.env.SEED_DEMO_USER === 'false') return null;

  const email = (process.env.DEMO_USER_EMAIL || DEFAULT_EMAIL).toLowerCase();
  const password = process.env.DEMO_USER_PASSWORD || DEFAULT_PASSWORD;

  const existing = await userRepository.findByEmail(email);
  if (existing) return existing;

  const passwordHash = await passwordHasher.hash(password);
  const user = await userRepository.save(
    new User({
      id: randomUUID(),
      email,
      passwordHash,
      name: process.env.DEMO_USER_NAME || DEFAULT_NAME,
    }),
  );

  logger.log?.(`Seeded demo user: ${email}`);
  return user;
}

module.exports = { seedDemoUser, DEFAULT_EMAIL, DEFAULT_PASSWORD, DEFAULT_NAME };
