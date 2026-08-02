'use strict';

const { createProxyMiddleware } = require('http-proxy-middleware');
const config = require('../config');
const { requireAuth } = require('../middleware/auth');

function mountProxies(app) {
  app.use(
    '/api/auth',
    createProxyMiddleware({
      target: config.authServiceUrl,
      changeOrigin: true,
      pathRewrite: { '^/api/auth': '/auth' },
      on: {
        proxyReq: (proxyReq) => {
          proxyReq.removeHeader('cookie');
        },
      },
    }),
  );

  app.use(
    '/api/gear',
    createProxyMiddleware({
      target: config.coreServiceUrl,
      changeOrigin: true,
      pathRewrite: { '^/api/gear': '/gear' },
    }),
  );

  app.use(
    '/api/listings',
    requireAuth,
    createProxyMiddleware({
      target: config.coreServiceUrl,
      changeOrigin: true,
      pathRewrite: { '^/api/listings': '/listings' },
    }),
  );
}

module.exports = { mountProxies };
