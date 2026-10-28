'use strict';

const { Router } = require('express');
const { newId } = require('../store/memoryStore');
const { signToken, requireAuth } = require('../middleware/auth');
const { httpError } = require('../http/errors');
const { assertPassword, hashPassword, verifyPassword } = require('../security/passwords');
const { emailAddress, plain } = require('../security/text');
const config = require('../config');

function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone || null,
    role: user.role || 'both',
  };
}

function createAuthRouter(store) {
  const router = Router();

  router.post('/register', async (req, res, next) => {
    try {
      const email = emailAddress(req.body.email);
      const password = assertPassword(req.body.password);
      const name = plain(req.body.name, 80) || 'Bivvy member';
      const phone = req.body.phone ? plain(req.body.phone, 20) : null;
      if (!req.body.acceptTerms) throw httpError(400, 'You must accept the terms');

      for (const user of store.users.values()) {
        if (user.email === email) throw httpError(409, 'Email already registered');
      }

      const user = {
        id: newId('usr'),
        email,
        name,
        phone,
        role: 'both',
        passwordHash: await hashPassword(password),
        createdAt: new Date().toISOString(),
      };
      store.users.set(user.id, user);
      const accessToken = signToken(user);
      res.status(201).json({ accessToken, user: publicUser(user) });
    } catch (err) {
      next(err);
    }
  });

  router.post('/login', async (req, res, next) => {
    try {
      const email = emailAddress(req.body.email);
      const password = String(req.body.password || '');
      if (!password) throw httpError(400, 'Email and password are required');

      let found = null;
      for (const user of store.users.values()) {
        if (user.email === email) {
          found = user;
          break;
        }
      }
      if (!found) throw httpError(401, 'Invalid email or password');
      const ok = await verifyPassword(password, found.passwordHash);
      if (!ok) throw httpError(401, 'Invalid email or password');

      res.json({ accessToken: signToken(found), user: publicUser(found) });
    } catch (err) {
      next(err);
    }
  });

  router.get('/me', requireAuth, (req, res, next) => {
    try {
      const user = store.users.get(req.user.id);
      if (!user) throw httpError(404, 'User not found');
      res.json({ user: publicUser(user) });
    } catch (err) {
      next(err);
    }
  });

  return router;
}

async function seedDemoUser(store) {
  if (!config.seedDemoUser) return;
  const email = config.demoEmail.toLowerCase();
  for (const user of store.users.values()) {
    if (user.email === email) return;
  }
  const user = {
    id: 'usr_demo',
    email,
    name: 'Demo Camper',
    phone: null,
    role: 'both',
    passwordHash: await hashPassword(config.demoPassword),
    createdAt: new Date().toISOString(),
  };
  store.users.set(user.id, user);
  console.log(`[bivvy] demo user ready: ${email}`);
}

module.exports = { createAuthRouter, seedDemoUser };
