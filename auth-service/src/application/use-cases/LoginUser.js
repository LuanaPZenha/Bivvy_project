'use strict';

const { Email } = require('../../domain/value-objects/Email');

class LoginUser {
  constructor({ userRepository, passwordHasher, tokenService }) {
    this.userRepository = userRepository;
    this.passwordHasher = passwordHasher;
    this.tokenService = tokenService;
  }

  async execute({ email, password }) {
    const emailVo = new Email(email);
    const user = await this.userRepository.findByEmail(emailVo.value);
    if (!user || !user.passwordHash) {
      const err = new Error('Invalid credentials');
      err.status = 401;
      throw err;
    }

    const ok = await this.passwordHasher.compare(password, user.passwordHash);
    if (!ok) {
      const err = new Error('Invalid credentials');
      err.status = 401;
      throw err;
    }

    const tokens = await this.tokenService.issuePair(user);
    return { user: user.toPublic(), ...tokens };
  }
}

module.exports = { LoginUser };
