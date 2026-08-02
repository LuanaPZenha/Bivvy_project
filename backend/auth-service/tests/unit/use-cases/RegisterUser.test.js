'use strict';

const { RegisterUser } = require('../../../src/application/use-cases/RegisterUser');
const { LoginUser } = require('../../../src/application/use-cases/LoginUser');
const {
  InMemoryUserRepository,
} = require('../../../src/infrastructure/persistence/InMemoryUserRepository');

describe('RegisterUser use case', () => {
  const hasher = {
    hash: async (p) => `hashed:${p}`,
    compare: async (p, h) => h === `hashed:${p}`,
  };
  const tokenService = {
    issuePair: async (_user) => ({
      accessToken: 'access',
      refreshToken: 'refresh',
      tokenType: 'Bearer',
      expiresIn: '15m',
    }),
  };

  it('registers a new user', async () => {
    const repo = new InMemoryUserRepository();
    const useCase = new RegisterUser({
      userRepository: repo,
      passwordHasher: hasher,
      tokenService,
    });

    const result = await useCase.execute({
      email: 'hiker@example.com',
      password: 'securePass1',
      name: 'Alex',
    });

    expect(result.user.email).toBe('hiker@example.com');
    expect(result.accessToken).toBe('access');
    expect(result.user.passwordHash).toBeUndefined();
  });

  it('rejects short passwords', async () => {
    const useCase = new RegisterUser({
      userRepository: new InMemoryUserRepository(),
      passwordHasher: hasher,
      tokenService,
    });

    await expect(useCase.execute({ email: 'a@b.com', password: 'short' })).rejects.toThrow(
      /at least 8/,
    );
  });
});

describe('LoginUser use case', () => {
  it('rejects invalid credentials', async () => {
    const useCase = new LoginUser({
      userRepository: new InMemoryUserRepository(),
      passwordHasher: {
        hash: async (p) => p,
        compare: async () => false,
      },
      tokenService: { issuePair: async () => ({}) },
    });

    await expect(
      useCase.execute({ email: 'nobody@example.com', password: 'whatever12' }),
    ).rejects.toThrow(/Invalid credentials/);
  });
});
