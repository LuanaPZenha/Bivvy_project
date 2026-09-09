'use strict';

function requireUser(req, _res, next) {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    const err = new Error('Unauthorized');
    err.status = 401;
    return next(err);
  }
  req.actor = {
    userId: String(userId),
    email: req.headers['x-user-email'] ? String(req.headers['x-user-email']) : '',
    name: req.headers['x-user-name'] ? String(req.headers['x-user-name']) : '',
    role: req.headers['x-user-role'] ? String(req.headers['x-user-role']) : 'both',
  };
  return next();
}

module.exports = { requireUser };
