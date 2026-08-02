'use strict';

const express = require('express');
const helmet = require('helmet');
const { applySanitization } = require('./shared/security');
const { InMemoryUserRepository } = require('./infrastructure/persistence/InMemoryUserRepository');
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

function createApp(overrides = {}) {
  const userRepository = overrides.userRepository || new InMemoryUserRepository();
  const passwordHasher = overrides.passwordHasher || new BcryptPasswordHasher();
  const tokenService =
    overrides.tokenService ||
    new JwtTokenService({
      accessSecret: process.env.JWT_ACCESS_SECRET || 'test_access_secret_min_32_chars!!',
      refreshSecret: process.env.JWT_REFRESH_SECRET || 'test_refresh_secret_min_32_chars!',
    });
  const googleTokenVerifier =
    overrides.googleTokenVerifier || new GoogleIdTokenVerifier();

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

  if (overrides.seedDemoUser !== false) {
    seedDemoUser({ userRepository, passwordHasher }).catch((err) => {
      console.warn(`Demo user seed skipped: ${err.message}`);
    });
  }

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

  return app;
}

module.exports = { createApp };
