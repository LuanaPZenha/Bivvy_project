'use strict';

const ALLOWED_ROLES = new Set(['renter', 'owner', 'both']);

class User {
  /**
   * Password users require passwordHash. Google-only users may omit it.
   * Marketplace members default to `both` so they can rent and list gear.
   * @param {{
   *   id: string,
   *   email: string,
   *   passwordHash?: string|null,
   *   name: string,
   *   phone?: string|null,
   *   googleSub?: string|null,
   *   role?: string,
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
    role = 'both',
    acceptedTermsAt = null,
    createdAt = new Date(),
  }) {
    if (!email) {
      throw new Error('User requires email');
    }
    if (!passwordHash && !googleSub) {
      throw new Error('User requires passwordHash or googleSub');
    }
    const normalizedRole = String(role || 'both').toLowerCase();
    if (!ALLOWED_ROLES.has(normalizedRole)) {
      throw new Error('User role must be renter, owner, or both');
    }
    this.id = id;
    this.email = email.toLowerCase();
    this.passwordHash = passwordHash || null;
    this.name = name;
    this.phone = phone || null;
    this.googleSub = googleSub || null;
    this.role = normalizedRole;
    this.acceptedTermsAt = acceptedTermsAt || null;
    this.createdAt = createdAt;
  }

  toPublic() {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      phone: this.phone,
      role: this.role,
      acceptedTermsAt: this.acceptedTermsAt,
      createdAt: this.createdAt,
    };
  }
}

module.exports = { User, ALLOWED_ROLES };
