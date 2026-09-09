'use strict';

const { createProxyMiddleware, fixRequestBody } = require('http-proxy-middleware');
const config = require('../config');
const { requireAuth } = require('../middleware/auth');

/**
 * Gateway proxy notes:
 * - Mount prefixes are stripped by Express, so the upstream prefix is prepended.
 * - express.json() drains the body stream; fixRequestBody rewrites it upstream.
 * - After JWT verification, identity headers are forwarded to Core.
 */
function createServiceProxy({ target, upstreamPrefix, stripCookies = false }) {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    proxyTimeout: 15000,
    timeout: 15000,
    pathRewrite: (path) => `${upstreamPrefix}${path.replace(/^\/(?=$|\?)/, '')}`,
    on: {
      proxyReq: (proxyReq, req, res) => {
        if (stripCookies) proxyReq.removeHeader('cookie');
        if (req.user) {
          proxyReq.setHeader('x-user-id', req.user.sub || '');
          proxyReq.setHeader('x-user-email', req.user.email || '');
          proxyReq.setHeader('x-user-role', req.user.role || 'both');
          if (req.user.name) proxyReq.setHeader('x-user-name', req.user.name);
        }
        fixRequestBody(proxyReq, req, res);
      },
      error: (err, _req, res) => {
        console.error('[gateway] proxy error:', err.message);
        if (res.headersSent || typeof res.status !== 'function') return;
        res.status(502).json({ error: 'Upstream service unavailable' });
      },
    },
  });
}

function mountProxies(app) {
  app.use(
    '/api/auth',
    createServiceProxy({
      target: config.authServiceUrl,
      upstreamPrefix: '/auth',
      stripCookies: true,
    }),
  );

  app.use(
    '/api/gear',
    createServiceProxy({
      target: config.coreServiceUrl,
      upstreamPrefix: '/gear',
    }),
  );

  app.use(
    '/api/listings',
    requireAuth,
    createServiceProxy({
      target: config.coreServiceUrl,
      upstreamPrefix: '/listings',
    }),
  );

  app.use(
    '/api/bookings',
    requireAuth,
    createServiceProxy({
      target: config.coreServiceUrl,
      upstreamPrefix: '/bookings',
    }),
  );
}

module.exports = { mountProxies };
