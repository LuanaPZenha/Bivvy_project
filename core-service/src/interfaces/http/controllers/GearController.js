'use strict';

class GearController {
  constructor({ listNearYou, createListing }) {
    this.listNearYou = listNearYou;
    this.createListing = createListing;
  }

  nearYou = async (req, res, next) => {
    try {
      const result = await this.listNearYou.execute({
        category: req.query.category || 'all',
        maxDistanceMiles: Number(req.query.maxDistance) || 25,
      });
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  create = async (req, res, next) => {
    try {
      const listing = await this.createListing.execute(req.body);
      res.status(201).json(listing);
    } catch (err) {
      next(err);
    }
  };
}

module.exports = { GearController };
