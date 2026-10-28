'use strict';

function notFound(_req, res) {
  res.status(404).json({ error: 'Not found' });
}

function errorHandler(err, _req, res, _next) {
  const status = err.status || 500;
  if (status >= 500) {
    console.error('[bivvy]', err.message);
  }
  res.status(status).json({
    error: status === 500 ? 'Internal server error' : err.message,
  });
}

function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

module.exports = { notFound, errorHandler, httpError };
