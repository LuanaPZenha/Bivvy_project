'use strict';

const { User } = require('../../domain/entities/User');

/** In-memory adapter for bootstrap; replace with Postgres repository. */
class InMemoryUserRepository {
  constructor(seed = []) {
    this.users = new Map(seed.map((u) => [u.email, u]));
  }

  async findByEmail(email) {
    return this.users.get(email.toLowerCase()) || null;
  }

  async findById(id) {
    for (const user of this.users.values()) {
      if (user.id === id) return user;
    }
    return null;
  }

  async save(user) {
    const entity = user instanceof User ? user : new User(user);
    this.users.set(entity.email, entity);
    return entity;
  }
}

module.exports = { InMemoryUserRepository };
