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

  listImages = async (req, res, next) => {
    try {
      res.json(await this.getListingImage.list({ listingId: req.params.id }));
    } catch (err) {
      next(err);
    }
  };

  getImageBinary = async (req, res, next) => {
    try {
      const { buffer, contentType } = await this.getListingImage.getBinary({
        listingId: req.params.id,
        imageId: req.params.imageId,
      });
      res.setHeader('Content-Type', contentType || 'application/octet-stream');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.send(buffer);
    } catch (err) {
      next(err);
    }
  };

  addImage = async (req, res, next) => {
    try {
      if (!req.file) {
        const err = new Error('image file is required (field name: image)');
        err.status = 400;
        throw err;
      }
      const result = await this.addListingImage.execute(
        {
          listingId: req.params.id,
          buffer: req.file.buffer,
          contentType: req.file.mimetype,
          size: req.file.size,
        },
        req.actor || {},
      );
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  };

  checkoutCartHandler = async (req, res, next) => {
    try {
      const result = await this.checkoutCart.execute(req.body, req.actor || {});
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  };
}

module.exports = { GearController };
