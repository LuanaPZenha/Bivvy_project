'use strict';

const { LoginWithGoogle } = require('../../../src/application/use-cases/LoginWithGoogle');
const { InMemoryUserRepository } = require('../../../src/infrastructure/persistence/InMemoryUserRepository');
const { User } = require('../../../src/domain/entities/User');

describe('LoginWithGoogle', () => {
  function build({ verifyImpl } = {}) {
    const userRepository = new InMemoryUserRepository();
    const tokenService = {
      issuePair: jest.fn(async (user) => ({
        accessToken: `access-${user.id}`,
        refreshToken: 'refresh',
        tokenType: 'Bearer',
        expiresIn: '15m',
      })),
    };
    const googleTokenVerifier = {
      verify: jest.fn(
        verifyImpl ||
          (async () => ({
            email: 'hiker@example.com',
            emailVerified: true,
            name: 'Alex',
            sub: 'google-sub-1',
          })),
      ),
    };
    const useCase = new LoginWithGoogle({ userRepository, tokenService, googleTokenVerifier });
    return { useCase, userRepository, tokenService, googleTokenVerifier };
  }

  it('creates a Google user and returns token envelope', async () => {
    const { useCase, userRepository, tokenService } = build();
    const result = await useCase.execute({ idToken: 'fake-token' });

    expect(result.user.email).toBe('hiker@example.com');
    expect(result.accessToken).toBeDefined();
    expect(tokenService.issuePair).toHaveBeenCalled();
    const stored = await userRepository.findByEmail('hiker@example.com');
    expect(stored.googleSub).toBe('google-sub-1');
    expect(stored.passwordHash).toBeNull();
  });

  it('links Google to an existing password user without wiping password', async () => {
    const { useCase, userRepository } = build();
    await userRepository.save(
      new User({
        id: 'u1',
        email: 'hiker@example.com',
        passwordHash: 'hash',
        name: 'Alex',
      }),
    );

    const result = await useCase.execute({ idToken: 'fake-token' });
    expect(result.user.id).toBe('u1');
    const stored = await userRepository.findByEmail('hiker@example.com');
    expect(stored.passwordHash).toBe('hash');
    expect(stored.googleSub).toBe('google-sub-1');
  });
});
