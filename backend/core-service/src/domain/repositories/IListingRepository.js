'use strict';

class IListingRepository {
  async findNear(_filters) {
    throw new Error('Not implemented');
  }

  async findById(_id) {
    throw new Error('Not implemented');
  }

  async save(_listing) {
    throw new Error('Not implemented');
  }
}

module.exports = { IListingRepository };
