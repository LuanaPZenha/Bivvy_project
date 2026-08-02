'use strict';

const { Router } = require('express');

function createGearRouter(controller) {
  const router = Router();
  router.get('/near', (req, res, next) => controller.nearYou(req, res, next));
  return router;
}

function createListingsRouter(controller) {
  const router = Router();
  router.post('/', (req, res, next) => controller.create(req, res, next));
  return router;
}

module.exports = { createGearRouter, createListingsRouter };
