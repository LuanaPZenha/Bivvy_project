'use strict';

module.exports = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_ACCESS_SECRET || 'dev-only-change-me-bivvy-access',
  jwtExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '7d',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  seedDemoUser: process.env.SEED_DEMO_USER !== 'false',
  demoEmail: process.env.DEMO_USER_EMAIL || 'demo@bivvy.test',
  demoPassword: process.env.DEMO_USER_PASSWORD || 'BivvyDemo123',
  serviceFeeRate: 0.1,
  taxRate: 0.0805,
};
