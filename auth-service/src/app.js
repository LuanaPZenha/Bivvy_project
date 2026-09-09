'use strict';

const express = require('express');
const helmet = require('helmet');
const { applySanitization } = require('./shared/security');
const { InMemoryUserRepository } = require('./infrastructure/persistence/InMemoryUserRepository');
const { PostgresUserRepository } = require('./infrastructure/persistence/PostgresUserRepository');
const { seedDemoUser } = require('./infrastructure/persistence/seedDemoUser');
const { BcryptPasswordHasher } = require('./infrastructure/security/BcryptPasswordHasher');
const { JwtTokenService } = require('./infrastructure/security/JwtTokenService');
const { GoogleIdTokenVerifier } = require('./infrastructure/security/GoogleIdTokenVerifier');
const { RegisterUser } = require('./application/use-cases/RegisterUser');
const { LoginUser } = require('./application/use-cases/LoginUser');
const { LoginWithGoogle } = require('./application/use-cases/LoginWithGoogle');
const { RefreshSession } = require('./application/use-cases/RefreshSession');
const { AuthController } = require('./interfaces/http/controllers/AuthController');
const { createAuthRouter } = require('./interfaces/http/routes/authRoutes');

/** Postgres when DATABASE_URL is set, otherwise the in-memory bootstrap adapter. */
function resolveUserRepository(overrides) {
  if (overrides.userRepository) return overrides.userRepository;
  if (process.env.DATABASE_URL) return new PostgresUserRepository();
  return new InMemoryUserRepository();
}

function createApp(overrides = {}) {
  const userRepository = resolveUserRepository(overrides);
  const passwordHasher = overrides.passwordHasher || new BcryptPasswordHasher();
  const tokenService =
    overrides.tokenService ||
    new JwtTokenService({
      accessSecret: process.env.JWT_ACCESS_SECRET || 'test_access_secret_min_32_chars!!',
      refreshSecret: process.env.JWT_REFRESH_SECRET || 'test_refresh_secret_min_32_chars!',
    });
  const googleTokenVerifier = overrides.googleTokenVerifier || new GoogleIdTokenVerifier();

  const registerUser = new RegisterUser({ userRepository, passwordHasher, tokenService });
  const loginUser = new LoginUser({ userRepository, passwordHasher, tokenService });
  const loginWithGoogle = new LoginWithGoogle({
    userRepository,
    tokenService,
    googleTokenVerifier,
  });
  const refreshSession = new RefreshSession({ tokenService });
  const controller = new AuthController({
    registerUser,
    loginUser,
    refreshSession,
    loginWithGoogle,
  });

  const app = express();
  app.disable('x-powered-by');
  app.use(helmet());
  applySanitization(app);
  app.use(express.json({ limit: '50kb' }));

  app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'auth-service' }));
  app.use('/auth', createAuthRouter(controller));

  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    const status = err.status || 500;
    res.status(status).json({ error: status === 500 ? 'Internal server error' : err.message });
  });

  app.locals.userRepository = userRepository;
  app.locals.ready = bootstrap({ userRepository, passwordHasher, overrides });

  return app;
}

/** Applies migrations and seeds the demo account; resolves once the app can serve traffic. */
async function bootstrap({ userRepository, passwordHasher, overrides }) {
  if (typeof userRepository.migrate === 'function') {
    await userRepository.migrate();
  }
  if (overrides.seedDemoUser !== false) {
    try {
      await seedDemoUser({ userRepository, passwordHasher });
    } catch (err) {
      console.warn(`Demo user seed skipped: ${err.message}`);
    }
  }
}

module.exports = { createApp };
