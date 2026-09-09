'use strict';

const { Router } = require('express');
const { requireUser } = require('../middleware/identity');

function createGearRouter(controller) {
  const router = Router();
  router.get('/near', (req, res, next) => controller.nearYou(req, res, next));
  router.get('/:id', (req, res, next) => controller.getById(req, res, next));
  router.post('/:id/quote', (req, res, next) => controller.quote(req, res, next));
  return router;
}

function createListingsRouter(controller) {
  const router = Router();
  router.get('/mine', requireUser, (req, res, next) => controller.mine(req, res, next));
  router.post('/', requireUser, (req, res, next) => controller.create(req, res, next));
  return router;
}

function createBookingsRouter(controller) {
  const router = Router();
  router.get('/', requireUser, (req, res, next) =>
    controller.listBookingsHandler(req, res, next),
  );
  router.post('/', requireUser, (req, res, next) =>
    controller.createBookingHandler(req, res, next),
  );
  router.patch('/:id', requireUser, (req, res, next) =>
    controller.updateBookingStatusHandler(req, res, next),
  );
  router.post('/:id/checkout', requireUser, (req, res, next) =>
    controller.checkoutHandler(req, res, next),
  );
  return router;
}

module.exports = { createGearRouter, createListingsRouter, createBookingsRouter };
