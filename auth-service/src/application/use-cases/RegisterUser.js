'use strict';

const { randomUUID } = require('crypto');
const { User } = require('../../domain/entities/User');
const { Email } = require('../../domain/value-objects/Email');
const { Phone } = require('../../domain/value-objects/Phone');

const MIN_PASSWORD_LENGTH = 8;

class RegisterUser {
  /**
   * @param {{ userRepository: import('../../domain/repositories/IUserRepository').IUserRepository, passwordHasher: { hash: (p: string) => Promise<string> }, tokenService: { issuePair: (user: User) => Promise<object> } }} deps
   */
  constructor({ userRepository, passwordHasher, tokenService }) {
    this.userRepository = userRepository;
    this.passwordHasher = passwordHasher;
    this.tokenService = tokenService;
  }

  async execute({ email, password, name, phone, acceptTerms }) {
    if (!password || password.length < MIN_PASSWORD_LENGTH) {
      throw badRequest(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
    }
    if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      throw badRequest('Password must include letters and numbers');
    }
    if (acceptTerms !== true) {
      throw badRequest('You must accept the Terms of Service');
    }

    const emailVo = new Email(email);
    const phoneVo = phone ? new Phone(phone) : null;

    const existing = await this.userRepository.findByEmail(emailVo.value);
    if (existing) {
      throw conflict('Email already registered');
    }

    const passwordHash = await this.passwordHasher.hash(password);
    const user = new User({
      id: randomUUID(),
      email: emailVo.value,
      passwordHash,
      name: (name || '').trim() || emailVo.value.split('@')[0],
      phone: phoneVo ? phoneVo.value : null,
      acceptedTermsAt: new Date(),
    });

    await this.userRepository.save(user);
    const tokens = await this.tokenService.issuePair(user);

    return { user: user.toPublic(), ...tokens };
  }
}

function badRequest(message) {
  const err = new Error(message);
  err.status = 400;
  return err;
}

function conflict(message) {
  const err = new Error(message);
  err.status = 409;
  return err;
}

module.exports = { RegisterUser };
