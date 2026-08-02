'use strict';

/**
 * @typedef {import('../entities/User').User} User
 */

/**
 * Port — implemented in infrastructure.
 * @interface
 */
class IUserRepository {
  /** @returns {Promise<User|null>} */
  async findByEmail(_email) {
    throw new Error('Not implemented');
  }

  /** @returns {Promise<User|null>} */
  async findById(_id) {
    throw new Error('Not implemented');
  }

  /** @returns {Promise<User>} */
  async save(_user) {
    throw new Error('Not implemented');
  }
}

module.exports = { IUserRepository };
