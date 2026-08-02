'use strict';

const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * Optional JWT gate for protected proxy routes.
 * Auth routes remain public; Core listing write routes require Bearer token.
 */
function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = header.slice(7);
  try {
    if (!config.jwtAccessSecret) {
      return res.status(500).json({ error: 'Auth misconfigured' });
    }
    req.user = jwt.verify(token, config.jwtAccessSecret);
    return next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = { requireAuth };
