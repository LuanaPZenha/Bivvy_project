'use strict';

const { randomUUID } = require('crypto');
const { User } = require('../../domain/entities/User');
const { Email } = require('../../domain/value-objects/Email');

class LoginWithGoogle {
  /**
   * @param {{
   *   userRepository: { findByEmail: Function, save: Function },
   *   tokenService: { issuePair: Function },
   *   googleTokenVerifier: { verify: Function }
   * }} deps
   */
  constructor({ userRepository, tokenService, googleTokenVerifier }) {
    this.userRepository = userRepository;
    this.tokenService = tokenService;
    this.googleTokenVerifier = googleTokenVerifier;
  }

  async execute({ idToken }) {
    const profile = await this.googleTokenVerifier.verify(idToken);
    const emailVo = new Email(profile.email);

    let user = await this.userRepository.findByEmail(emailVo.value);
    if (!user) {
      user = new User({
        id: randomUUID(),
        email: emailVo.value,
        name: profile.name,
        googleSub: profile.sub,
        passwordHash: null,
      });
      await this.userRepository.save(user);
    } else if (!user.googleSub) {
      user.googleSub = profile.sub;
      await this.userRepository.save(user);
    }

    const tokens = await this.tokenService.issuePair(user);
    return { user: user.toPublic(), ...tokens };
  }
}

module.exports = { LoginWithGoogle };
