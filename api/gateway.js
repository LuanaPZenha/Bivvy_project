'use strict';

const config = require('../server/src/config');
const { createApp } = require('../server/src/app');

config.assertProductionConfig(config);
const app = createApp({ seedOnRequest: true });

function routeVercelRequest(req) {
  const incoming = req.url || '/';
  const qIndex = incoming.indexOf('?');
  const params = new URLSearchParams(qIndex >= 0 ? incoming.slice(qIndex + 1) : '');
  const path = params.get('__bivvy_path');
  if (!path) return;
  params.delete('__bivvy_path');
  const rest = params.toString();
  const target = path === 'health' ? '/health' : `/api/${path}`;
  req.url = rest ? `${target}?${rest}` : target;
}

function handler(req, res) {
  routeVercelRequest(req);
  return app(req, res);
}

module.exports = handler;
module.exports.routeVercelRequest = routeVercelRequest;
