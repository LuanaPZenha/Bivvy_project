'use strict';

module.exports = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:8081',
  authServiceUrl: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
  coreServiceUrl: process.env.CORE_SERVICE_URL || 'http://localhost:3002',
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || '',
  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX) || 100,
};
