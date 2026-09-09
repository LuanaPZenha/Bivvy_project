'use strict';

class GearController {
  constructor(deps) {
    Object.assign(this, deps);
  }

  nearYou = async (req, res, next) => {
    try {
      const result = await this.listNearYou.execute({
        category: req.query.category || 'all',
        mode: req.query.mode || 'all',
        query: req.query.q || req.query.query || '',
        maxDistanceMiles: Number(req.query.maxDistance) || 25,
        zipCode: req.query.zip || req.query.zipCode || null,
      });
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  getById = async (req, res, next) => {
    try {
      res.json(await this.getListingById.execute({ id: req.params.id }));
    } catch (err) {
      next(err);
    }
  };

  create = async (req, res, next) => {
    try {
      const listing = await this.createListing.execute(req.body, req.actor || {});
      res.status(201).json(listing);
    } catch (err) {
      next(err);
    }
  };

  mine = async (req, res, next) => {
    try {
      res.json(
        await this.listOwnerListings.execute({ ownerId: req.actor && req.actor.userId }),
      );
    } catch (err) {
      next(err);
    }
  };

  quote = async (req, res, next) => {
    try {
      res.json(
        await this.quoteBooking.execute({
          listingId: req.body.listingId || req.params.id,
          startDate: req.body.startDate,
          endDate: req.body.endDate,
        }),
      );
    } catch (err) {
      next(err);
    }
  };

  createBookingHandler = async (req, res, next) => {
    try {
      const result = await this.createBooking.execute(req.body, req.actor || {});
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  };

  listBookingsHandler = async (req, res, next) => {
    try {
      res.json(await this.listBookings.execute({ userId: req.actor && req.actor.userId }));
    } catch (err) {
      next(err);
    }
  };

  updateBookingStatusHandler = async (req, res, next) => {
    try {
      res.json(
        await this.updateBookingStatus.execute({
          bookingId: req.params.id,
          status: req.body.status,
          userId: req.actor && req.actor.userId,
        }),
      );
    } catch (err) {
      next(err);
    }
  };

  checkoutHandler = async (req, res, next) => {
    try {
      const booking = await this.simulateCheckout.execute({
        bookingId: req.params.id,
        userId: req.actor && req.actor.userId,
      });
      res.json({ booking, message: 'Payment simulated successfully' });
    } catch (err) {
      next(err);
    }
  };
}

module.exports = { GearController };
