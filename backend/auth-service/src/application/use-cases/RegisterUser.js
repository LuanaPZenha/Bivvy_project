'use strict';

const { User } = require('../../domain/entities/User');
const { Email } = require('../../domain/value-objects/Email');

class RegisterUser {
  /**
   * @param {{ userRepository: import('../../domain/repositories/IUserRepository').IUserRepository, passwordHasher: { hash: (p: string) => Promise<string> }, tokenService: { issuePair: (user: User) => Promise<object> } }} deps
   */
  constructor({ userRepository, passwordHasher, tokenService }) {
    this.userRepository = userRepository;
    this.passwordHasher = passwordHasher;
    this.tokenService = tokenService;
  }

  async execute({ email, password, name }) {
    if (!password || password.length < 8) {
      const err = new Error('Password must be at least 8 characters');
      err.status = 400;
      throw err;
    }

    const emailVo = new Email(email);
    const existing = await this.userRepository.findByEmail(emailVo.value);
    if (existing) {
      const err = new Error('Email already registered');
      err.status = 409;
      throw err;
    }

    const passwordHash = await this.passwordHasher.hash(password);
    const user = new User({
      id: cryptoRandomId(),
      email: emailVo.value,
      passwordHash,
      name: name || emailVo.value.split('@')[0],
    });

    await this.userRepository.save(user);
    const tokens = await this.tokenService.issuePair(user);

    return { user: user.toPublic(), ...tokens };
  }
}

function cryptoRandomId() {
  return require('crypto').randomUUID();
}

module.exports = { RegisterUser };
