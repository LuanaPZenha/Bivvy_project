'use strict';

const { createProxyMiddleware, fixRequestBody } = require('http-proxy-middleware');
const config = require('../config');
const { requireAuth } = require('../middleware/auth');

/**
 * Gateway proxy notes:
 * - Mount prefixes are stripped by Express, so the upstream prefix is prepended.
 * - express.json() drains JSON bodies; fixRequestBody rewrites them upstream.
 * - Multipart uploads must NOT call fixRequestBody — the raw stream is forwarded.
 * - After JWT verification, identity headers are forwarded to Core.
 */
function createServiceProxy({ target, upstreamPrefix, stripCookies = false, timeoutMs = 15000 }) {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    proxyTimeout: timeoutMs,
    timeout: timeoutMs,
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
        const contentType = String(req.headers['content-type'] || '');
        if (contentType.includes('multipart/form-data')) {
          return;
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
      timeoutMs: 60000,
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

  app.use(
    '/api/cart',
    requireAuth,
    createServiceProxy({
      target: config.coreServiceUrl,
      upstreamPrefix: '/cart',
    }),
  );
}

module.exports = { mountProxies };
