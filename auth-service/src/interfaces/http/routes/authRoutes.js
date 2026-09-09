'use strict';

const { Router } = require('express');
const rateLimit = require('express-rate-limit');

function createAuthRouter(controller) {
  const router = Router();

  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { error: 'Too many login attempts' },
  });

  router.post('/register', (req, res, next) => controller.register(req, res, next));
  router.post('/login', loginLimiter, (req, res, next) => controller.login(req, res, next));
  router.post('/google', loginLimiter, (req, res, next) => controller.google(req, res, next));
  router.post('/refresh', (req, res, next) => controller.refresh(req, res, next));

  return router;
}

module.exports = { createAuthRouter };
