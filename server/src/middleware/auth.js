'use strict';

const jwt = require('jsonwebtoken');
const config = require('../config');

function signToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role || 'both',
    },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn },
  );
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const match = /^Bearer\s+(.+)$/i.exec(header);
  if (!match) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  try {
    const payload = jwt.verify(match[1], config.jwtSecret);
    req.user = {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      role: payload.role || 'both',
    };
    return next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function optionalAuth(req, _res, next) {
  const header = req.headers.authorization || '';
  const match = /^Bearer\s+(.+)$/i.exec(header);
  if (!match) return next();
  try {
    const payload = jwt.verify(match[1], config.jwtSecret);
    req.user = {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      role: payload.role || 'both',
    };
  } catch {
    // ignore
  }
  return next();
}

module.exports = { signToken, requireAuth, optionalAuth };
