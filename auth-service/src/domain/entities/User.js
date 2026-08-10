'use strict';

class User {
  /**
   * Password users require passwordHash. Google-only users may omit it.
   * @param {{
   *   id: string,
   *   email: string,
   *   passwordHash?: string|null,
   *   name: string,
   *   phone?: string|null,
   *   googleSub?: string|null,
   *   acceptedTermsAt?: Date|null,
   *   createdAt?: Date
   * }} props
   */
  constructor({
    id,
    email,
    passwordHash = null,
    name,
    phone = null,
    googleSub = null,
    acceptedTermsAt = null,
    createdAt = new Date(),
  }) {
    if (!email) {
      throw new Error('User requires email');
    }
    if (!passwordHash && !googleSub) {
      throw new Error('User requires passwordHash or googleSub');
    }
    this.id = id;
    this.email = email.toLowerCase();
    this.passwordHash = passwordHash || null;
    this.name = name;
    this.phone = phone || null;
    this.googleSub = googleSub || null;
    this.acceptedTermsAt = acceptedTermsAt || null;
    this.createdAt = createdAt;
  }

  toPublic() {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      phone: this.phone,
      acceptedTermsAt: this.acceptedTermsAt,
      createdAt: this.createdAt,
    };
  }
}

module.exports = { User };
