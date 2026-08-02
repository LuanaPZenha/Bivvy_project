'use strict';

class User {
  constructor({ id, email, passwordHash, name, createdAt = new Date() }) {
    if (!email || !passwordHash) {
      throw new Error('User requires email and passwordHash');
    }
    this.id = id;
    this.email = email.toLowerCase();
    this.passwordHash = passwordHash;
    this.name = name;
    this.createdAt = createdAt;
  }

  toPublic() {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      createdAt: this.createdAt,
    };
  }
}

module.exports = { User };
